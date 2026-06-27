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
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{trip.destination}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ·{" "}
            {trip.num_travelers} traveler{trip.num_travelers === 1 ? "" : "s"} ·{" "}
            <span className="capitalize">{trip.budget_tier}</span> ·{" "}
            <span className="capitalize">{trip.vibe}</span>
          </p>
          {total > 0 && (
            <p className="mt-2 text-lg font-semibold">
              Total estimated cost: ≈ ${total}
            </p>
          )}
        </div>

        <div className="mb-6">
          <TripActions tripId={trip.id} />
        </div>

        <DayView events={events} />
      </main>
    </>
  );
}
