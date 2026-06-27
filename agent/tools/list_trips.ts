import { defineTool } from "eve/tools";
import { z } from "zod";
import { getTripsByUser } from "@/lib/supabase/queries";

export default defineTool({
  description:
    "List the signed-in user's saved trips. user_id comes from the session context.",
  inputSchema: z.object({ user_id: z.string().min(1) }),
  async execute({ user_id }) {
    const trips = await getTripsByUser(user_id);
    return {
      trips: trips.map((t) => ({
        id: t.id,
        destination: t.destination,
        start_date: t.start_date,
        end_date: t.end_date,
        num_travelers: t.num_travelers,
        budget_tier: t.budget_tier,
        vibe: t.vibe,
      })),
    };
  },
});
