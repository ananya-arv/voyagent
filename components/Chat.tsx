"use client";

import { useEffect, useRef, useState } from "react";
import { useEveAgent } from "eve/react";

const SUGGESTIONS = [
  "Plan a relaxed 3-day trip to Lisbon for 2, mid budget, Sept 10–12.",
  "A packed long weekend in Tokyo for one — first timer.",
  "Five days in Rome with a teen, no early mornings.",
];

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

  const [value, setValue] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isEmpty = agent.data.messages.length === 0;

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [agent.data.messages, agent.status]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    void agent.send({ message: trimmed });
    setValue("");
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[420px] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_60px_-32px_rgba(20,35,58,0.3)]">
      {/* Conversation */}
      <div
        ref={scrollerRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6"
      >
        {isEmpty ? (
          <div className="m-auto max-w-sm text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-wash text-lg text-brand-deep">
              ✦
            </span>
            <h2 className="mt-4 font-heading text-2xl font-medium text-ink">
              Where are we headed?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Describe the trip in your own words. I&apos;ll build a timed,
              day-by-day plan and save it to your trips when it&apos;s ready.
            </p>
          </div>
        ) : (
          agent.data.messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role === "user" ? "user" : "assistant"}
              text={message.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("")}
            />
          ))
        )}

        {agent.status === "submitted" && <TypingBubble />}

        {agent.status === "error" && (
          <p className="mr-auto rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {agent.error?.message ?? "Something went wrong — try again."}
          </p>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line bg-mist/40 px-4 pb-4 pt-3 sm:px-6">
        {isEmpty && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-line bg-background px-3 py-1.5 text-left text-xs text-slate transition-colors hover:border-brand/50 hover:bg-brand-wash hover:text-brand-deep"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(value);
          }}
          className="flex items-end gap-2 rounded-2xl border border-line bg-background p-2 pl-4 transition-colors focus-within:border-brand/60"
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(value);
              }
            }}
            rows={1}
            placeholder="Message Voyagent…"
            disabled={isBusy}
            aria-label="Message Voyagent"
            className="max-h-32 min-h-[1.5rem] flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-slate/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!value.trim() || isBusy}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink text-background transition-all hover:bg-brand disabled:opacity-40"
            aria-label="Send message"
          >
            <span className="text-base leading-none">{isBusy ? "…" : "↗"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  text,
}: {
  role: "user" | "assistant";
  text: string;
}) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="animate-pop ml-auto max-w-[82%] whitespace-pre-line rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm leading-relaxed text-background">
        {text}
      </div>
    );
  }
  return (
    <div className="animate-pop mr-auto flex max-w-[88%] gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-wash text-[0.8rem] text-brand-deep">
        ✦
      </span>
      <p className="whitespace-pre-line rounded-2xl rounded-tl-md bg-sky px-4 py-2.5 text-sm leading-relaxed text-ink">
        {text}
      </p>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="mr-auto flex max-w-[88%] gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-wash text-[0.8rem] text-brand-deep">
        ✦
      </span>
      <span className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-sky px-4 py-3.5">
        <span className="typing-dot size-1.5 rounded-full bg-slate" />
        <span className="typing-dot size-1.5 rounded-full bg-slate [animation-delay:0.2s]" />
        <span className="typing-dot size-1.5 rounded-full bg-slate [animation-delay:0.4s]" />
      </span>
    </div>
  );
}
