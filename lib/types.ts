// Shared domain types for Voyagent. These mirror the Supabase schema
// (supabase/schema.sql) and the Claude itinerary output schema (lib/claude.ts).

export type BudgetTier = "budget" | "mid" | "luxury";
export type Vibe = "relaxed" | "packed" | "adventurous";
export type EventCategory =
  | "flight"
  | "hotel"
  | "restaurant"
  | "activity"
  | "transport";

export interface TripIntake {
  destination: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  num_travelers: number;
  budget_tier: BudgetTier;
  vibe: Vibe;
  dietary_notes?: string | null;
  must_haves?: string | null;
}

// Rows as stored in Supabase.
export interface UserRow {
  id: string;
  email: string;
  created_at: string;
}

export interface TripRow extends TripIntake {
  id: string;
  user_id: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  trip_id: string;
  day_number: number;
  date: string; // YYYY-MM-DD
  time_start: string; // "HH:MM"
  time_end: string; // "HH:MM"
  title: string;
  category: EventCategory;
  location_name: string;
  location_address: string;
  description: string;
  booking_url: string | null;
  estimated_cost_usd: number | null;
  created_at: string;
}

export interface TripWithEvents {
  trip: TripRow;
  events: EventRow[];
}

// ─── Claude / AI output shape ────────────────────────────────
// The structured itinerary returned by the model (lib/claude.ts) and the
// Eve save_itinerary tool. Kept here so the Supabase layer doesn't depend
// on the Anthropic SDK.
export interface GeneratedEvent {
  time_start: string; // "HH:MM"
  time_end: string; // "HH:MM"
  title: string;
  category: EventCategory;
  location_name: string;
  location_address: string;
  description: string;
  booking_url: string | null;
  estimated_cost_usd: number | null;
}

export interface GeneratedDay {
  day_number: number;
  date: string; // YYYY-MM-DD
  theme: string;
  events: GeneratedEvent[];
}

export interface GeneratedItinerary {
  destination: string;
  summary: string;
  days: GeneratedDay[];
}
