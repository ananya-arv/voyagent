import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORY_ICON } from "@/lib/itinerary-utils";
import type { EventRow } from "@/lib/types";

export function EventCard({ event }: { event: EventRow }) {
  const location = [event.location_name, event.location_address]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="tabular-nums">
                {event.time_start}–{event.time_end}
              </span>
              <Badge variant="secondary" className="capitalize">
                {CATEGORY_ICON[event.category] ?? "•"} {event.category}
              </Badge>
            </div>
            <h4 className="mt-1 font-medium">{event.title}</h4>
            {location && (
              <p className="mt-0.5 text-sm text-muted-foreground">📍 {location}</p>
            )}
            {event.description && (
              <p className="mt-2 text-sm leading-relaxed">{event.description}</p>
            )}
          </div>
          {event.estimated_cost_usd != null && (
            <div className="shrink-0 text-right text-sm font-medium tabular-nums">
              ≈ ${event.estimated_cost_usd}
            </div>
          )}
        </div>
        {event.booking_url && (
          <div className="mt-3">
            <a
              href={event.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Book {event.category}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
