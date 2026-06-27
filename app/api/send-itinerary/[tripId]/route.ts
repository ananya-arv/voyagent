import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getCurrentUser } from "@/lib/session";
import { getTripWithEvents } from "@/lib/supabase/queries";
import { ItineraryEmail } from "@/emails/ItineraryEmail";
import { appBaseUrl } from "@/lib/itinerary-utils";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const { tripId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json(
      { error: "No email address on your account." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured (RESEND_API_KEY missing)." },
      { status: 500 },
    );
  }

  try {
    const data = await getTripWithEvents(tripId);
    if (!data) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    if (data.trip.user_id !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Voyagent <onboarding@resend.dev>",
      to: user.email,
      subject: `Your itinerary for ${data.trip.destination}`,
      react: ItineraryEmail({
        trip: data.trip,
        events: data.events,
        baseUrl: appBaseUrl(),
      }),
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    await captureError(err, { route: "send-itinerary", tripId, userId: user.sub });
    return NextResponse.json(
      { error: "Could not send the itinerary email. Please try again." },
      { status: 500 },
    );
  }
}
