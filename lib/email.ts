// No `server-only` guard — bundled by the Eve agent runtime too (see supabase/server.ts).
import { Resend } from "resend";
import { ItineraryEmail } from "@/emails/ItineraryEmail";
import { getTripWithEvents, getUserById } from "@/lib/supabase/queries";
import { appBaseUrl } from "@/lib/itinerary-utils";

// Shared "email the full itinerary" path used by the Eve email_itinerary tool.
// The /api/send-itinerary route uses the authenticated session's email; this
// helper resolves the trip owner's email from the DB (for non-request callers).
export async function sendItineraryEmailForTrip(tripId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const data = await getTripWithEvents(tripId);
  if (!data) throw new Error("Trip not found.");

  const owner = await getUserById(data.trip.user_id);
  if (!owner?.email) throw new Error("No email address on the trip owner.");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Voyagent <onboarding@resend.dev>",
    to: owner.email,
    subject: `Your itinerary for ${data.trip.destination}`,
    react: ItineraryEmail({
      trip: data.trip,
      events: data.events,
      baseUrl: appBaseUrl(),
    }),
  });
  if (error) throw new Error(error.message);
}
