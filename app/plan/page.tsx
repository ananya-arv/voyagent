import { SiteHeader } from "@/components/SiteHeader";
import { IntakeForm } from "@/components/IntakeForm";

export default function PlanPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <p className="eyebrow">The brief</p>
        <h1 className="mt-2 font-heading text-4xl font-medium tracking-tight text-ink">
          Plan your trip
        </h1>
        <p className="mt-3 mb-10 max-w-lg text-base text-slate">
          A few details and Voyagent will build your day-by-day itinerary —
          with booking links for stays, restaurants, and activities. Prefer to
          talk it through?{" "}
          <a href="/chat" className="text-brand-deep underline underline-offset-2">
            Use chat instead
          </a>
          .
        </p>
        <div className="rounded-[1.75rem] border border-line bg-card p-7 shadow-[0_30px_70px_-44px_rgba(7,58,68,0.45)] sm:p-10">
          <IntakeForm />
        </div>
      </main>
    </>
  );
}
