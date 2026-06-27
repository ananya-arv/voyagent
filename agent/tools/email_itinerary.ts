import { defineTool } from "eve/tools";
import { z } from "zod";
import { sendItineraryEmailForTrip } from "@/lib/email";

export default defineTool({
  description:
    "Email the full itinerary for a trip to its owner via Resend. Use after the trip is saved.",
  inputSchema: z.object({ trip_id: z.string().min(1) }),
  async execute({ trip_id }) {
    await sendItineraryEmailForTrip(trip_id);
    return { success: true as const };
  },
});
