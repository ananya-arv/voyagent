"use client";

import { useEveAgent } from "eve/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Chat({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const agent = useEveAgent({
    // Attach the authenticated user to every turn so the agent can pass
    // user_id / user_email through to the save_itinerary tool.
    prepareSend: (input) => ({
      ...input,
      clientContext: { user_id: userId, user_email: userEmail },
    }),
  });

  const isBusy = agent.status === "submitted" || agent.status === "streaming";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {agent.data.messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Say something like &ldquo;Plan a relaxed 3-day trip to Lisbon for 2
            on a mid budget, Sept 10–12.&rdquo;
          </p>
        )}
        {agent.data.messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm"
            }
          >
            {message.parts.map((part, i) =>
              part.type === "text" ? <p key={i}>{part.text}</p> : null,
            )}
          </div>
        ))}
        {agent.status === "error" && (
          <p className="text-sm text-destructive">
            {agent.error?.message ?? "Something went wrong."}
          </p>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const message = String(form.get("message") ?? "").trim();
          if (message.length > 0) {
            void agent.send({ message });
            event.currentTarget.reset();
          }
        }}
        className="flex gap-2"
      >
        <Input name="message" placeholder="Message Voyagent…" disabled={isBusy} />
        <Button type="submit" disabled={isBusy}>
          {isBusy ? "…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
