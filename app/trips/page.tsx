import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { getTripsByUser } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/itinerary-utils";
import type { TripRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const user = await getCurrentUser();

  let trips: TripRow[] = [];
  let loadError = false;
  if (user) {
    try {
      trips = await getTripsByUser(user.sub);
    } catch {
      loadError = true;
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your travels</p>
            <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight text-ink">
              My trips
            </h1>
          </div>
          <Link href="/plan" className={buttonVariants({ size: "sm" })}>
            New trip
          </Link>
        </div>

        {loadError ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Could not load your trips. Check the Supabase configuration.
          </p>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-mist/40 px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-wash text-lg text-brand-deep">
              ✈
            </span>
            <p className="mt-4 text-sm text-slate">
              No trips yet — the map&apos;s wide open.
            </p>
            <Link
              href="/plan"
              className={buttonVariants({ size: "sm", className: "mt-4" })}
            >
              Plan your first one
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="group block"
              >
                <Card className="ring-line transition-all hover:-translate-y-0.5 hover:ring-brand/40 hover:shadow-[0_18px_40px_-28px_rgba(20,35,58,0.4)]">
                  <CardContent className="flex items-center gap-4 p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mist text-base transition-colors group-hover:bg-brand-wash">
                      ✈
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-heading text-lg font-medium text-ink">
                          {trip.destination}
                        </h2>
                        <span className="font-mono text-xs uppercase tracking-wide text-slate capitalize">
                          {trip.vibe} · {trip.budget_tier}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate">
                        {formatDate(trip.start_date)} – {formatDate(trip.end_date)}{" "}
                        · {trip.num_travelers} traveler
                        {trip.num_travelers === 1 ? "" : "s"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
