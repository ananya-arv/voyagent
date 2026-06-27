import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="mx-auto max-w-2xl py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your trip, planned in one sentence.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tell Voyagent where and when you&apos;re going. Get a clean,
            day-by-day itinerary you can export to your calendar and email to
            yourself — powered by Claude.
          </p>
          <div className="mt-8">
            <Link href="/plan" className={buttonVariants({ size: "lg" })}>
              Plan my trip
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            You&apos;ll be asked to sign in first.
          </p>
        </div>
      </main>
    </>
  );
}
