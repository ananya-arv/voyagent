import { defineTool } from "eve/tools";
import { z } from "zod";
import { appBaseUrl } from "@/lib/itinerary-utils";

export default defineTool({
  description:
    "Return the .ics calendar download link for a trip so the user can add it to their calendar.",
  inputSchema: z.object({ trip_id: z.string().min(1) }),
  async execute({ trip_id }) {
    return { url: `${appBaseUrl()}/api/export-ics/${trip_id}` };
  },
});
