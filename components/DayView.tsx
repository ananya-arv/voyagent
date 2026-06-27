"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/EventCard";
import { groupByDay, formatDate } from "@/lib/itinerary-utils";
import type { EventRow } from "@/lib/types";

export function DayView({ events }: { events: EventRow[] }) {
  const days = groupByDay(events);

  if (days.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-mist/50 px-4 py-6 text-center text-sm text-slate">
        No events found for this trip yet.
      </p>
    );
  }

  return (
    <Tabs defaultValue={String(days[0].day_number)} className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-full bg-mist p-1">
        {days.map((d) => (
          <TabsTrigger
            key={d.day_number}
            value={String(d.day_number)}
            className="rounded-full px-4 py-1.5 text-slate data-active:bg-background data-active:text-ink data-active:shadow-sm"
          >
            Day {d.day_number}
          </TabsTrigger>
        ))}
      </TabsList>

      {days.map((d) => (
        <TabsContent key={d.day_number} value={String(d.day_number)} className="mt-6">
          <div className="mb-5 flex items-baseline gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-deep">
              Day {d.day_number}
            </span>
            <span className="h-px flex-1 bg-line" />
            <span className="font-heading text-lg text-ink">
              {formatDate(d.date)}
            </span>
          </div>
          <ol className="relative ml-1.5 border-l border-line">
            {d.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </ol>
        </TabsContent>
      ))}
    </Tabs>
  );
}
