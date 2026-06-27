import ical from "ical-generator";
import { getCurrentUser } from "@/lib/session";
import { getTripWithEvents } from "@/lib/supabase/queries";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

// Combine a "YYYY-MM-DD" date and "HH:MM" time into a Date.
function combine(date: string, time: string): Date {
  return new Date(`${date}T${time.length === 5 ? time : "09:00"}:00`);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const { tripId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await getTripWithEvents(tripId);
    if (!data) return new Response("Trip not found", { status: 404 });
    if (data.trip.user_id !== user.sub) {
      return new Response("Forbidden", { status: 403 });
    }

    const cal = ical({ name: `Voyagent — ${data.trip.destination}` });

    for (const e of data.events) {
      cal.createEvent({
        start: combine(e.date, e.time_start),
        end: combine(e.date, e.time_end),
        summary: e.title,
        description: [
          e.description,
          e.booking_url ? `Booking: ${e.booking_url}` : null,
          e.estimated_cost_usd != null ? `Est. cost: $${e.estimated_cost_usd}` : null,
        ]
          .filter(Boolean)
          .join("\n\n"),
        location: [e.location_name, e.location_address]
          .filter(Boolean)
          .join(", "),
      });
    }

    const filename = `voyagent-${data.trip.destination
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}.ics`;

    return new Response(cal.toString(), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    await captureError(err, { route: "export-ics", tripId });
    return new Response("Failed to generate calendar file", { status: 500 });
  }
}
