import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { deleteTrip, getTripWithEvents } from "@/lib/supabase/queries";
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

  try {
    const data = await getTripWithEvents(tripId);
    if (!data) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    if (data.trip.user_id !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteTrip(tripId);
    return NextResponse.json({ success: true });
  } catch (err) {
    await captureError(err, { route: "delete-trip", tripId, userId: user.sub });
    return NextResponse.json(
      { error: "Could not delete the trip. Please try again." },
      { status: 500 },
    );
  }
}
