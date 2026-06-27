import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { GeneratedItinerary, TripIntake } from "@/lib/types";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts/itinerary";
import { captureError } from "@/lib/observability";

// Direct Anthropic SDK path (spec-canonical). The Eve agent uses AI Gateway
// instead; this is what /api/generate-itinerary calls.
export const ITINERARY_MODEL = "claude-sonnet-4-6";

// Strict structured-output schema mirroring lib/types.ts GeneratedItinerary.
// Passed to messages.parse() via zodOutputFormat so the response is guaranteed
// to validate — no reliance on "return ONLY JSON" prompt discipline.
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
  day_number: z.number(),
  date: z.string(),
  theme: z.string(),
  events: z.array(eventSchema),
});

export const itinerarySchema = z.object({
  destination: z.string(),
  summary: z.string(),
  days: z.array(daySchema),
});

export class ItineraryGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItineraryGenerationError";
  }
}

/**
 * Generate a structured day-by-day itinerary via the Anthropic API using
 * structured outputs. Throws ItineraryGenerationError on refusal / parse
 * failure; the raw response is captured to Sentry for diagnosis.
 */
export async function generateItinerary(
  intake: TripIntake,
): Promise<GeneratedItinerary> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  let rawResponse: unknown;

  try {
    // Stream the response. At max_tokens this high the full generation can take
    // a couple of minutes; a non-streaming request risks hitting platform/SDK
    // request timeouts (504), so we stream and assemble the final message.
    const stream = client.messages.stream({
      model: ITINERARY_MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(intake) }],
      output_config: { format: zodOutputFormat(itinerarySchema) },
    });
    const message = await stream.finalMessage();
    rawResponse = message;

    if (message.stop_reason === "refusal") {
      throw new ItineraryGenerationError(
        "The model declined to generate this itinerary.",
      );
    }

    // Structured outputs emit the schema-shaped JSON as text; assemble + validate.
    const jsonText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed: GeneratedItinerary;
    try {
      parsed = itinerarySchema.parse(JSON.parse(jsonText)) as GeneratedItinerary;
    } catch {
      throw new ItineraryGenerationError(
        "The model response did not match the expected itinerary schema.",
      );
    }

    return parsed;
  } catch (err) {
    await captureError(err, { intake, rawResponse });
    if (err instanceof ItineraryGenerationError) throw err;
    throw new ItineraryGenerationError(
      err instanceof Error ? err.message : "Failed to generate itinerary.",
    );
  }
}
