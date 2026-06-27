import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DayView } from "@/components/DayView";
import { Chat } from "@/components/Chat";
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
    <div className="voyagent-dark voyagent-aurora flex min-h-screen flex-col">
      <SiteHeader />

      <div className="flex flex-1 flex-col gap-4 p-4 lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
        {/* Left — Eve assistant (35%) */}
        <aside className="glass-panel flex h-[60vh] flex-col overflow-hidden rounded-3xl lg:h-full lg:w-[35%]">
          <Chat userId={user.sub} userEmail={user.email} />
        </aside>

        {/* Right — itinerary timeline (65%) */}
        <main className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl lg:w-[65%]">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-balance text-2xl font-bold tracking-tight text-white">
                  {trip.destination}
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ·{" "}
                  {trip.num_travelers} traveler
                  {trip.num_travelers === 1 ? "" : "s"} ·{" "}
                  <span className="capitalize">{trip.budget_tier}</span> ·{" "}
                  <span className="capitalize">{trip.vibe}</span>
                </p>
              </div>
              {total > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-right">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">
                    Est. total
                  </div>
                  <div className="font-mono text-lg font-semibold text-white">
                    ${total}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <TripActions tripId={trip.id} />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <DayView events={events} />
          </div>
        </main>
      </div>
    </div>
  );
}
