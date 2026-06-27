import { SiteHeader } from "@/components/SiteHeader";
import { HeroChat } from "@/components/HeroChat";

const STEPS = [
  {
    k: "01",
    title: "Say it in a sentence",
    body: "Destination, dates, who's going, the vibe. Plain language — no forms to wrestle.",
  },
  {
    k: "02",
    title: "Claude times the day",
    body: "Every stop gets a slot, a rough cost, and a booking link where it helps.",
  },
  {
    k: "03",
    title: "Take it with you",
    body: "Export to your calendar or send the whole plan to your inbox.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="atmosphere relative">
          <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
            <div className="animate-rise">
              <h1 className="font-heading text-[2.75rem] font-medium leading-[1.04] tracking-tight text-ink sm:text-6xl">
                Say where.
                <br />
                We&apos;ll handle the{" "}
                <span className="italic text-brand">where-to-next.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-slate">
                Tell Voyagent your trip in a sentence and get a calm,
                day-by-day itinerary — every stop timed and costed, with
                booking links for stays (Airbnb, hotels), restaurants, and
                activities. Powered by Claude.
              </p>
              <dl className="mt-8 flex gap-8">
                <div>
                  <dt className="font-mono text-2xl text-ink">60s</dt>
                  <dd className="text-sm text-slate">to a full plan</dd>
                </div>
                <div className="border-l border-line pl-8">
                  <dt className="font-mono text-2xl text-ink">.ics</dt>
                  <dd className="text-sm text-slate">straight to calendar</dd>
                </div>
                <div className="border-l border-line pl-8">
                  <dt className="font-mono text-2xl text-ink">timed</dt>
                  <dd className="text-sm text-slate">down to the hour</dd>
                </div>
              </dl>
            </div>

            <div className="animate-rise [animation-delay:0.12s]">
              <HeroChat />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-line bg-mist/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <p className="eyebrow">The route</p>
            <h2 className="mt-3 max-w-md font-heading text-3xl font-medium tracking-tight text-ink">
              Three stops from idea to itinerary.
            </h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.k} className="bg-background p-6">
                  <span className="font-mono text-sm text-brand">{s.k}</span>
                  <h3 className="mt-3 font-heading text-xl font-medium text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate sm:flex-row sm:px-6">
          <span className="flex items-center gap-2">
            <span className="text-ink">✈</span> Voyagent
          </span>
          <span className="text-xs">Itineraries drafted by Claude — always double-check times and prices.</span>
        </div>
      </footer>
    </>
  );
}
