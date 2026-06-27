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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My trips</h1>
          <Link href="/plan" className={buttonVariants({ size: "sm" })}>
            New trip
          </Link>
        </div>

        {loadError ? (
          <p className="text-sm text-destructive">
            Could not load your trips. Check the Supabase configuration.
          </p>
        ) : trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No trips yet.{" "}
            <Link href="/plan" className="underline">
              Plan your first one
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-3">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-medium">{trip.destination}</h2>
                      <span className="text-sm text-muted-foreground capitalize">
                        {trip.vibe} · {trip.budget_tier}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ·{" "}
                      {trip.num_travelers} traveler
                      {trip.num_travelers === 1 ? "" : "s"}
                    </p>
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
