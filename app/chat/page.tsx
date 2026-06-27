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
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Plan by chat</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Chat with Voyagent to build and save an itinerary. It&apos;ll save to
          your trips when ready.
        </p>
        <Chat userId={user.sub} userEmail={user.email} />
      </main>
    </>
  );
}
