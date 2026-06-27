import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORY_ICON } from "@/lib/itinerary-utils";
import type { EventRow } from "@/lib/types";

// One stop on the day's journey line. The node + monospace time sit on the
// spine drawn by the parent <ol> in DayView.
export function EventCard({ event }: { event: EventRow }) {
  const location = [event.location_name, event.location_address]
    .filter(Boolean)
    .join(", ");

  return (
    <li className="relative pl-8 pb-7 last:pb-0">
      <span
        aria-hidden
        className="absolute left-0 top-1 size-3 -translate-x-1/2 rounded-full border-2 border-brand bg-background ring-4 ring-background"
      />

      <div className="flex items-baseline gap-2 font-mono text-xs tracking-tight">
        <span className="tabular-nums font-medium text-brand-deep">
          {event.time_start}
        </span>
        <span className="text-slate/60">→ {event.time_end}</span>
      </div>

      <div className="mt-2 rounded-xl border border-line bg-card p-4 transition-colors hover:border-brand/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge
              variant="secondary"
              className="gap-1 bg-mist capitalize text-slate"
            >
              {CATEGORY_ICON[event.category] ?? "•"} {event.category}
            </Badge>
            <h4 className="mt-2 font-heading text-lg font-medium leading-snug text-ink">
              {event.title}
            </h4>
            {location && (
              <p className="mt-1 text-sm text-slate">📍 {location}</p>
            )}
            {event.description && (
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {event.description}
              </p>
            )}
          </div>
          {event.estimated_cost_usd != null && (
            <div className="shrink-0 text-right font-mono text-sm font-medium tabular-nums text-ink">
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
      </div>
    </li>
  );
}
