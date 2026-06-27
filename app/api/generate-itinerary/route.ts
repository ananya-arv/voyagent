import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { tripIntakeSchema } from "@/lib/validation";
import { generateItinerary } from "@/lib/claude";
import { insertTripWithEvents, upsertUser } from "@/lib/supabase/queries";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";
export const maxDuration = 120; // itinerary generation can take a while

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = tripIntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const itinerary = await generateItinerary(parsed.data);
    await upsertUser(user.sub, user.email);
    const tripId = await insertTripWithEvents(user.sub, parsed.data, itinerary);
    return NextResponse.json({ tripId });
  } catch (err) {
    await captureError(err, { route: "generate-itinerary", userId: user.sub });
    return NextResponse.json(
      { error: "Could not generate your itinerary. Please try again." },
      { status: 500 },
    );
  }
}
