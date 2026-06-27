import { SiteHeader } from "@/components/SiteHeader";
import { Chat } from "@/components/Chat";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await getCurrentUser();
  // /chat is protected by middleware; guard anyway.
  if (!user) return null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Plan by chat</p>
            <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight text-ink">
              Talk it through
            </h1>
          </div>
          <p className="hidden max-w-[16rem] text-right text-sm text-slate sm:block">
            Voyagent saves the finished itinerary to your trips automatically.
          </p>
        </div>
        <Chat userId={user.sub} userEmail={user.email} />
      </main>
    </>
  );
}
