"use client";

import {
  Plane,
  Hotel,
  Utensils,
  Ticket,
  CarFront,
  MapPin,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory, EventRow } from "@/lib/types";

const CATEGORY_META: Record<
  EventCategory,
  { icon: LucideIcon; label: string; tint: string }
> = {
  flight: { icon: Plane, label: "Flight", tint: "199 89% 64%" },
  hotel: { icon: Hotel, label: "Hotel", tint: "262 83% 68%" },
  restaurant: { icon: Utensils, label: "Dining", tint: "24 95% 62%" },
  activity: { icon: Ticket, label: "Activity", tint: "152 60% 55%" },
  transport: { icon: CarFront, label: "Transport", tint: "47 95% 60%" },
};

export function EventCard({ event }: { event: EventRow }) {
  const meta = CATEGORY_META[event.category] ?? CATEGORY_META.activity;
  const Icon = meta.icon;
  const location = [event.location_name, event.location_address]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] hover:border-white/25 hover:bg-white/[0.05] hover:shadow-[0_8px_40px_-12px_rgba(99,102,241,0.45)]"
      style={{ ["--tint" as string]: meta.tint }}
    >
      {/* Hover tint glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `hsl(${meta.tint} / 0.25)` }}
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-3.5">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `hsl(${meta.tint} / 0.14)`,
            color: `hsl(${meta.tint})`,
          }}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tabular-nums text-white/50">
              {event.time_start}–{event.time_end}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              style={{
                background: `hsl(${meta.tint} / 0.12)`,
                color: `hsl(${meta.tint})`,
              }}
            >
              {meta.label}
            </span>
          </div>

          <h4 className="mt-1.5 text-balance font-medium leading-snug text-white">
            {event.title}
          </h4>

          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </p>
          )}

          {event.description && (
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {event.description}
            </p>
          )}

          {event.booking_url && (
            <a
              href={event.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
            >
              Book {meta.label.toLowerCase()}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {event.estimated_cost_usd != null && (
          <div className="shrink-0 text-right">
            <div className="font-mono text-sm font-semibold tabular-nums text-white">
              ${event.estimated_cost_usd}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">
              est.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
