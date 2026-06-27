import { defineTool } from "eve/tools";
import { z } from "zod";
import { getTripWithEvents } from "@/lib/supabase/queries";

export default defineTool({
  description: "Get a saved trip's full day-by-day itinerary by id.",
  inputSchema: z.object({ trip_id: z.string().min(1) }),
  async execute({ trip_id }) {
    const data = await getTripWithEvents(trip_id);
    if (!data) return { found: false as const };
    return { found: true as const, trip: data.trip, events: data.events };
  },
});
