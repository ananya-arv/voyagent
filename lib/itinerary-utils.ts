import type { EventRow } from "@/lib/types";

export interface DayGroup {
  day_number: number;
  date: string;
  events: EventRow[];
}

/** Group flat event rows into ordered days. */
export function groupByDay(events: EventRow[]): DayGroup[] {
  const map = new Map<number, DayGroup>();
  for (const e of events) {
    let group = map.get(e.day_number);
    if (!group) {
      group = { day_number: e.day_number, date: e.date, events: [] };
      map.set(e.day_number, group);
    }
    group.events.push(e);
  }
  const days = Array.from(map.values()).sort((a, b) => a.day_number - b.day_number);
  for (const d of days) d.events.sort((a, b) => a.time_start.localeCompare(b.time_start));
  return days;
}

export function totalEstimatedCost(events: EventRow[]): number {
  return events.reduce((sum, e) => sum + (e.estimated_cost_usd ?? 0), 0);
}

/** Human-readable date, e.g. "Wed, Sep 10". Safe for "YYYY-MM-DD" input. */
export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const CATEGORY_ICON: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  restaurant: "🍽️",
  activity: "🎟️",
  transport: "🚕",
};

export function appBaseUrl(): string {
  return process.env.APP_BASE_URL ?? "http://localhost:3000";
}
