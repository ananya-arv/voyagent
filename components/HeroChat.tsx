"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; text: string };

// Canned previews so the hero is genuinely interactive before sign-in.
// Each is a short "shape of the trip" — the real agent does the timed plan.
const PREVIEWS: { match: RegExp; reply: string }[] = [
  {
    match: /lisbon|portugal/i,
    reply:
      "Lisbon in 3 days — here's the shape of it:\nDay 1 · Alfama lanes, then sunset at Miradouro de Santa Luzia\nDay 2 · Belém pastéis and a slow afternoon in Sintra\nDay 3 · LX Factory, Time Out Market, tram 28 home",
  },
  {
    match: /tokyo|japan/i,
    reply:
      "Tokyo, leaning relaxed:\nDay 1 · Yanaka backstreets and a kissaten coffee\nDay 2 · teamLab, then izakaya-hopping in Ebisu\nDay 3 · Shimokitazawa vintage and a quiet onsen",
  },
  {
    match: /rome|italy/i,
    reply:
      "Rome without the rush:\nDay 1 · Trastevere mornings, Pantheon at dusk\nDay 2 · Borghese gardens and a long lunch in Monti\nDay 3 · Testaccio market, then aperitivo on a rooftop",
  },
  {
    match: /reykjavik|iceland/i,
    reply:
      "Reykjavík, golden-hour everything:\nDay 1 · old harbour, Hallgrímskirkja, a wool-shop detour\nDay 2 · Golden Circle loop with a Secret Lagoon soak\nDay 3 · Reynisfjara black sand and puffin-spotting",
  },
];

const GENERIC = (place: string) =>
  `${place} sounds wonderful. I'd shape it into calm mornings, one anchor each afternoon, and dinners booked ahead.\nTell me your dates and budget and I'll time every stop — with booking links.`;

const CHIPS = ["A relaxed 3 days in Lisbon", "First time in Tokyo", "A long weekend in Rome"];

function previewFor(text: string): string {
  const hit = PREVIEWS.find((p) => p.match.test(text));
  if (hit) return hit.reply;
  // Pull a plausible place name: last capitalised word, else the whole line.
  const place = text.replace(/[.!?]+$/, "").split(/\s+/).slice(-1)[0] || "There";
  return GENERIC(place.charAt(0).toUpperCase() + place.slice(1));
}

export function HeroChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "I'm your travel concierge. Tell me where and when — I'll hand back a timed, day-by-day plan.",
    },
  ]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setStarted(true);
    setValue("");
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: previewFor(trimmed) }]);
      setTyping(false);
    }, 1100);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_60px_-32px_rgba(20,35,58,0.35)]">
      {/* Title bar — a boarding-pass header */}
      <div className="flex items-center justify-between border-b border-line bg-mist/60 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-ink text-xs text-background">
            ✈
          </span>
          <span className="text-sm font-medium">Voyagent concierge</span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate">
          <span className="size-1.5 rounded-full bg-brand" />
          online
        </span>
      </div>

      {/* Conversation */}
      <div
        ref={scrollerRef}
        className="flex max-h-[300px] min-h-[210px] flex-col gap-3 overflow-y-auto px-5 py-5"
      >
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
        {typing && <TypingBubble />}
      </div>

      {/* Composer */}
      <div className="border-t border-line px-4 pb-4 pt-3">
        {!started && (
          <div className="mb-3 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                className="rounded-full border border-line bg-background px-3 py-1.5 text-xs text-slate transition-colors hover:border-brand/50 hover:bg-brand-wash hover:text-brand-deep"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(value);
          }}
          className="flex items-center gap-2 rounded-2xl border border-line bg-background p-1.5 pl-4 transition-colors focus-within:border-brand/60"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Where to?"
            aria-label="Describe your trip"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate/60"
          />
          <button
            type="submit"
            disabled={!value.trim() || typing}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink text-background transition-all hover:bg-brand disabled:opacity-40"
            aria-label="Send"
          >
            <span className="text-base leading-none">↗</span>
          </button>
        </form>

        {started && (
          <div className="animate-rise mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Link href="/plan" className={buttonVariants({ size: "sm" })}>
              Make it real →
            </Link>
            <Link
              href="/chat"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Keep chatting
            </Link>
            <span className="text-xs text-slate">You&apos;ll sign in to save it.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={
        isUser
          ? "animate-pop ml-auto max-w-[82%] whitespace-pre-line rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm text-background"
          : "animate-pop mr-auto flex max-w-[88%] gap-2.5"
      }
    >
      {!isUser && (
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-wash text-[0.7rem] text-brand-deep">
          ✦
        </span>
      )}
      {isUser ? (
        msg.text
      ) : (
        <p className="whitespace-pre-line rounded-2xl rounded-tl-md bg-sky px-4 py-2.5 text-sm leading-relaxed text-ink">
          {msg.text}
        </p>
      )}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="mr-auto flex max-w-[88%] gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-wash text-[0.7rem] text-brand-deep">
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
