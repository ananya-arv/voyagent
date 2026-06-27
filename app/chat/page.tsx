import { SiteHeader } from "@/components/SiteHeader";
import { Chat } from "@/components/Chat";
import { getCurrentUser } from "@/lib/session";
import { Compass, MapPin, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await getCurrentUser();
  // /chat is protected by middleware; guard anyway.
  if (!user) return null;

  return (
    <div className="voyagent-dark voyagent-aurora flex min-h-screen flex-col">
      <SiteHeader />

      <div className="flex flex-1 flex-col gap-4 p-4 lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
        {/* Left — Eve assistant (35%) */}
        <aside className="glass-panel flex h-[65vh] flex-col overflow-hidden rounded-3xl lg:h-full lg:w-[35%]">
          <Chat userId={user.sub} userEmail={user.email} />
        </aside>

        {/* Right — onboarding canvas (65%) */}
        <main className="glass-panel relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-10 lg:w-[65%]">
          <div className="relative flex max-w-md flex-col items-center text-center">
            <div className="glow-ring flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20">
              <Compass
                className="size-7 text-indigo-200"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <h1 className="mt-5 text-balance text-2xl font-bold tracking-tight text-white">
              Plan a trip with Eve
            </h1>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-white/55">
              Describe where and when you&apos;re going. Eve drafts a clean,
              day-by-day itinerary and saves it to your trips when it&apos;s
              ready.
            </p>

            <ul className="mt-8 grid w-full gap-3 text-left">
              {[
                {
                  icon: MapPin,
                  title: "Set the destination",
                  body: "City, dates, travelers and budget.",
                },
                {
                  icon: CalendarDays,
                  title: "Get a daily plan",
                  body: "Flights, hotels, dining and activities.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <Icon
                    className="mt-0.5 size-5 shrink-0 text-indigo-300"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {title}
                    </div>
                    <div className="text-sm text-white/50">{body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
