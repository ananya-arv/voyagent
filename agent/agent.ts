import { anthropic } from "@ai-sdk/anthropic";
import { defineAgent } from "eve";

export default defineAgent({
  // Call the Anthropic API directly (reads ANTHROPIC_API_KEY) instead of routing
  // through the Vercel AI Gateway. Direct provider ids use hyphens
  // (claude-sonnet-4-6), unlike the gateway's dotted id (anthropic/claude-sonnet-4.6).
  model: anthropic("claude-sonnet-4-6"),
});
