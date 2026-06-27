// No `server-only` guard — bundled by the Eve agent runtime too (see server.ts).
import { getServiceClient } from "./server";
import type {
  EventRow,
  GeneratedItinerary,
  TripIntake,
  TripRow,
  TripWithEvents,
} from "@/lib/types";

// A thin, typed data-access layer. All Supabase reads/writes go through here
// so route handlers and Eve tools never embed queries inline. Each function
// throws a descriptive Error on failure; callers wrap with try/catch +
// Sentry and surface a friendly message.

export async function upsertUser(id: string, email: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("users")
    .upsert({ id, email }, { onConflict: "id" });
  if (error) throw new Error(`Failed to upsert user: ${error.message}`);
}

/**
 * Insert a trip and all of its events in one logical operation.
 * Returns the new trip id.
 */
export async function insertTripWithEvents(
  userId: string,
  intake: TripIntake,
  itinerary: GeneratedItinerary,
): Promise<string> {
  const supabase = getServiceClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: userId,
      destination: intake.destination,
      start_date: intake.start_date,
      end_date: intake.end_date,
      num_travelers: intake.num_travelers,
      age: intake.age,
      budget_tier: intake.budget_tier,
      vibe: intake.vibe,
      dietary_notes: intake.dietary_notes ?? null,
      must_haves: intake.must_haves ?? null,
    })
    .select("id")
    .single();

  if (tripError || !trip) {
    throw new Error(`Failed to create trip: ${tripError?.message ?? "no row returned"}`);
  }

  const tripId = trip.id as string;

  const eventRows = itinerary.days.flatMap((day) =>
    day.events.map((event) => ({
      trip_id: tripId,
      day_number: day.day_number,
      date: day.date,
      time_start: event.time_start,
      time_end: event.time_end,
      title: event.title,
      category: event.category,
      location_name: event.location_name,
      location_address: event.location_address,
      description: event.description,
      booking_url: event.booking_url,
      estimated_cost_usd: event.estimated_cost_usd,
    })),
  );

  if (eventRows.length > 0) {
    const { error: eventsError } = await supabase.from("events").insert(eventRows);
    if (eventsError) {
      // Best-effort cleanup so we don't leave an orphaned trip with no events.
      await supabase.from("trips").delete().eq("id", tripId);
      throw new Error(`Failed to create events: ${eventsError.message}`);
    }
  }

  return tripId;
}

/** Delete a trip and (via ON DELETE CASCADE) all of its events. */
export async function deleteTrip(tripId: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) throw new Error(`Failed to delete trip: ${error.message}`);
}

export async function getUserById(
  id: string,
): Promise<{ id: string; email: string } | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("id,email")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load user: ${error.message}`);
  return (data as { id: string; email: string } | null) ?? null;
}

export async function getTripsByUser(userId: string): Promise<TripRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load trips: ${error.message}`);
  return (data ?? []) as TripRow[];
}

export async function getTripWithEvents(
  tripId: string,
): Promise<TripWithEvents | null> {
  const supabase = getServiceClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError) throw new Error(`Failed to load trip: ${tripError.message}`);
  if (!trip) return null;

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("trip_id", tripId)
    .order("day_number", { ascending: true })
    .order("time_start", { ascending: true });
  if (eventsError) throw new Error(`Failed to load events: ${eventsError.message}`);

  return { trip: trip as TripRow, events: (events ?? []) as EventRow[] };
}

/**
 * For the nightly digest: all events dated `date` (YYYY-MM-DD), joined with
 * their trip + owner. Used by /api/cron/daily-digest.
 */
export interface DigestRow {
  trip: TripRow;
  user: { id: string; email: string };
  events: EventRow[];
}

export async function getDigestsForDate(date: string): Promise<DigestRow[]> {
  const supabase = getServiceClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("date", date)
    .order("time_start", { ascending: true });
  if (error) throw new Error(`Failed to load events for ${date}: ${error.message}`);

  const eventRows = (events ?? []) as EventRow[];
  if (eventRows.length === 0) return [];

  const tripIds = Array.from(new Set(eventRows.map((e) => e.trip_id)));

  const { data: trips, error: tripsError } = await supabase
    .from("trips")
    .select("*")
    .in("id", tripIds);
  if (tripsError) throw new Error(`Failed to load trips for digest: ${tripsError.message}`);
  const tripRows = (trips ?? []) as TripRow[];

  const userIds = Array.from(new Set(tripRows.map((t) => t.user_id)));
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id,email")
    .in("id", userIds);
  if (usersError) throw new Error(`Failed to load users for digest: ${usersError.message}`);
  const usersById = new Map(
    (users ?? []).map((u) => [u.id as string, u as { id: string; email: string }]),
  );

  return tripRows
    .map((trip) => {
      const user = usersById.get(trip.user_id);
      if (!user) return null;
      return {
        trip,
        user,
        events: eventRows.filter((e) => e.trip_id === trip.id),
      } satisfies DigestRow;
    })
    .filter((d): d is DigestRow => d !== null);
}
