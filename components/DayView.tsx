"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/EventCard";
import { groupByDay, formatDate } from "@/lib/itinerary-utils";
import type { EventRow } from "@/lib/types";

export function DayView({ events }: { events: EventRow[] }) {
  const days = groupByDay(events);

  if (days.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No events found for this trip.
      </p>
    );
  }

  return (
    <Tabs defaultValue={String(days[0].day_number)} className="w-full">
      <TabsList className="flex flex-wrap h-auto">
        {days.map((d) => (
          <TabsTrigger key={d.day_number} value={String(d.day_number)}>
            Day {d.day_number}
          </TabsTrigger>
        ))}
      </TabsList>
      {days.map((d) => (
        <TabsContent key={d.day_number} value={String(d.day_number)} className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">{formatDate(d.date)}</p>
          <div className="flex flex-col gap-3">
            {d.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
