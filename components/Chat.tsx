"use client";

import { useEffect, useRef } from "react";
import { useEveAgent } from "eve/react";
import { Sparkles, ArrowUp } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [agent.data.messages.length, agent.status]);

  const status = isBusy
    ? agent.status === "streaming"
      ? "Eve is composing…"
      : "Eve is thinking…"
    : "Eve is ready";

  return (
    <div className="flex h-full flex-col">
      {/* AI status indicator with ambient pulsing glow */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 glow-ring">
          <Sparkles
            className="size-4.5 text-indigo-200"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">Eve</div>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="relative flex size-2">
              {isBusy && (
                <span className="ambient-glow absolute inline-flex size-full rounded-full bg-indigo-400/70" />
              )}
              <span
                className={[
                  "relative inline-flex size-2 rounded-full",
                  isBusy ? "bg-indigo-400" : "bg-emerald-400",
                ].join(" ")}
              />
            </span>
            {status}
          </div>
        </div>
      </div>

      {/* Message stream */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
      >
        {agent.data.messages.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/60">
            Tell me about your trip — try{" "}
            <span className="text-white/90">
              &ldquo;Plan a relaxed 3-day trip to Lisbon for 2 on a mid budget,
              Sept 10–12.&rdquo;
            </span>
          </div>
        )}

        {agent.data.messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={[
                "animate-rise flex",
                isUser ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              <div
                className={[
                  "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_8px_30px_-10px_rgba(99,102,241,0.7)]"
                    : "border border-white/10 bg-white/[0.04] text-white/90 backdrop-blur-md",
                ].join(" ")}
              >
                {message.parts.map((part, i) =>
                  part.type === "text" ? <p key={i}>{part.text}</p> : null,
                )}
              </div>
            </div>
          );
        })}

        {agent.status === "submitted" && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="thinking-dot size-1.5 rounded-full bg-indigo-300"
                  style={{ animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {agent.status === "error" && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {agent.error?.message ?? "Something went wrong."}
          </div>
        )}
      </div>

      {/* Glassmorphic input bar */}
      <div className="px-4 pb-4">
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
          className="glow-ring flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-2 pl-4 pr-2 backdrop-blur-md transition-colors focus-within:border-white/25"
        >
          <input
            name="message"
            placeholder="Message Eve…"
            disabled={isBusy}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isBusy}
            aria-label="Send message"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white transition-all duration-200 hover:shadow-[0_6px_24px_-6px_rgba(99,102,241,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="size-4.5" strokeWidth={2.25} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
