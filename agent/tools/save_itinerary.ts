import { defineTool } from "eve/tools";
import { z } from "zod";
import { insertTripWithEvents, upsertUser } from "@/lib/supabase/queries";
import { appBaseUrl } from "@/lib/itinerary-utils";
import type { GeneratedItinerary, TripIntake } from "@/lib/types";

const eventSchema = z.object({
  time_start: z.string(),
  time_end: z.string(),
  title: z.string(),
  category: z.enum(["flight", "hotel", "restaurant", "activity", "transport"]),
  location_name: z.string(),
  location_address: z.string(),
  description: z.string(),
  booking_url: z.string().nullable(),
  estimated_cost_usd: z.number().nullable(),
});

const daySchema = z.object({
  day_number: z.number().int(),
  date: z.string(),
  theme: z.string(),
  events: z.array(eventSchema),
});

export default defineTool({
  description:
    "Persist a completed day-by-day itinerary for the signed-in user. Call this once the plan is final. user_id and user_email come from the session context. Returns the trip id and a link.",
  inputSchema: z.object({
    user_id: z.string().min(1),
    user_email: z.string().min(1),
    destination: z.string(),
    origin: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    num_travelers: z.number().int().min(1),
    group_type: z.enum(["solo", "couple", "family", "friends"]),
    departure_time: z.enum(["morning", "night", "either"]),
    budget_tier: z.enum(["budget", "mid", "luxury"]),
    vibe: z.enum(["relaxed", "packed", "adventurous"]),
    dietary_notes: z.string().nullable().optional(),
    must_haves: z.string().nullable().optional(),
    summary: z.string(),
    days: z.array(daySchema),
  }),
  async execute(input) {
    const intake: TripIntake = {
      destination: input.destination,
      origin: input.origin,
      start_date: input.start_date,
      end_date: input.end_date,
      num_travelers: input.num_travelers,
      group_type: input.group_type,
      departure_time: input.departure_time,
      budget_tier: input.budget_tier,
      vibe: input.vibe,
      dietary_notes: input.dietary_notes ?? null,
      must_haves: input.must_haves ?? null,
    };
    const itinerary: GeneratedItinerary = {
      destination: input.destination,
      summary: input.summary,
      days: input.days,
    };

    await upsertUser(input.user_id, input.user_email);
    const tripId = await insertTripWithEvents(input.user_id, intake, itinerary);

    return { tripId, url: `${appBaseUrl()}/trips/${tripId}` };
  },
});
