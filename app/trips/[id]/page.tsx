import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DayView } from "@/components/DayView";
import { TripActions } from "@/components/TripActions";
import { getCurrentUser } from "@/lib/session";
import { getTripWithEvents } from "@/lib/supabase/queries";
import { formatDate, totalEstimatedCost } from "@/lib/itinerary-utils";

export const dynamic = "force-dynamic";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const data = await getTripWithEvents(id);
  if (!data || data.trip.user_id !== user.sub) notFound();

  const { trip, events } = data;
  const total = totalEstimatedCost(events);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-6 overflow-hidden rounded-3xl border border-line atmosphere">
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Your itinerary</p>
                <h1 className="mt-2 font-heading text-4xl font-medium tracking-tight text-ink">
                  {trip.destination}
                </h1>
                <p className="mt-2 text-sm text-slate">
                  {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ·{" "}
                  {trip.num_travelers} traveler
                  {trip.num_travelers === 1 ? "" : "s"} ·{" "}
                  <span className="capitalize">{trip.budget_tier}</span> ·{" "}
                  <span className="capitalize">{trip.vibe}</span>
                </p>
              </div>
              {total > 0 && (
                <div className="text-right">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate">
                    Est. total
                  </p>
                  <p className="font-mono text-3xl font-medium tabular-nums text-ink">
                    ≈ ${total}
                  </p>
                </div>
              )}
            </div>
            <TripActions tripId={trip.id} />
          </div>
        </div>

        <DayView events={events} />
      </main>
    </>
  );
}
