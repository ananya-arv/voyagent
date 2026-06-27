/**
 * Standalone verification of the Claude itinerary generator.
 *
 * Run with the API key loaded from .env.local:
 *   node --env-file=.env.local --import tsx scripts/test-claude.ts
 * (or export ANTHROPIC_API_KEY then: npx tsx scripts/test-claude.ts)
 *
 * Prints a schema-valid itinerary for a sample trip. This de-risks the core
 * before any UI is built.
 */
import { generateItinerary } from "@/lib/claude";
import type { TripIntake } from "@/lib/types";

const sample: TripIntake = {
  destination: "Lisbon, Portugal",
  start_date: "2026-09-10",
  end_date: "2026-09-12",
  num_travelers: 2,
  age: 30,
  budget_tier: "mid",
  vibe: "relaxed",
  dietary_notes: "one vegetarian",
  must_haves: "a pastel de nata tasting and a sunset viewpoint",
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "ANTHROPIC_API_KEY is not set — skipping live call.\n" +
        "Set it in .env.local and run:\n" +
        "  node --env-file=.env.local --import tsx scripts/test-claude.ts",
    );
    return;
  }

  console.log("Generating itinerary for", sample.destination, "...\n");
  const itinerary = await generateItinerary(sample);

  console.log("Summary:", itinerary.summary, "\n");
  for (const day of itinerary.days) {
    console.log(`── Day ${day.day_number} (${day.date}) — ${day.theme}`);
    for (const e of day.events) {
      const cost = e.estimated_cost_usd != null ? ` ~$${e.estimated_cost_usd}` : "";
      console.log(`   ${e.time_start}-${e.time_end} [${e.category}] ${e.title}${cost}`);
      if (e.booking_url) console.log(`      ${e.booking_url}`);
    }
  }

  const eventCount = itinerary.days.reduce((n, d) => n + d.events.length, 0);
  console.log(`\nOK: ${itinerary.days.length} days, ${eventCount} events.`);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
