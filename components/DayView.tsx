"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { groupByDay, formatDate } from "@/lib/itinerary-utils";
import type { EventRow } from "@/lib/types";

export function DayView({ events }: { events: EventRow[] }) {
  const days = groupByDay(events);
  const [active, setActive] = useState(days[0]?.day_number ?? 1);

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        <CalendarDays
          className="size-8 text-white/30"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="mt-3 text-sm text-white/50">
          No events yet. Your itinerary will appear here.
        </p>
      </div>
    );
  }

  const current = days.find((d) => d.day_number === active) ?? days[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Horizontal day carousel */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d) => {
          const isActive = d.day_number === active;
          return (
            <button
              key={d.day_number}
              type="button"
              onClick={() => setActive(d.day_number)}
              aria-pressed={isActive}
              className={[
                "group relative shrink-0 rounded-xl border px-4 py-2.5 text-left transition-all duration-300",
                isActive
                  ? "glow-ring border-transparent bg-gradient-to-br from-indigo-500/20 to-violet-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <div
                className={[
                  "text-xs font-medium uppercase tracking-wide",
                  isActive ? "text-indigo-200" : "text-white/40",
                ].join(" ")}
              >
                Day {d.day_number}
              </div>
              <div
                className={[
                  "mt-0.5 whitespace-nowrap text-sm font-medium",
                  isActive ? "text-white" : "text-white/60",
                ].join(" ")}
              >
                {formatDate(d.date)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Vertical chronological timeline — keyed by day so entries re-stagger */}
      <div key={current.day_number} className="relative">
        <div
          className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-indigo-500/40 via-white/10 to-transparent"
          aria-hidden="true"
        />
        <ol className="flex flex-col gap-3">
          {current.events.map((e, i) => (
            <li
              key={e.id}
              className="animate-rise relative pl-10"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                className="absolute left-[15px] top-5 size-2.5 -translate-x-1/2 rounded-full bg-indigo-400 ring-4 ring-indigo-400/15"
                aria-hidden="true"
              />
              <EventCard event={e} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
