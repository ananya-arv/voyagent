"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "mid", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
] as const;

const VIBE_OPTIONS = [
  { value: "relaxed", label: "Relaxed" },
  { value: "packed", label: "Packed" },
  { value: "adventurous", label: "Adventurous" },
] as const;

const FIELD = "h-11 text-base";

function Section({
  n,
  title,
  hint,
  children,
}: {
  n: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-brand">{n}</span>
        <span className="font-medium text-ink">{title}</span>
        {hint && <span className="text-xs text-slate">{hint}</span>}
        <span className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  );
}

export function IntakeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetIdx, setBudgetIdx] = useState(1); // mid
  const [vibeIdx, setVibeIdx] = useState(0); // relaxed

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      destination: String(fd.get("destination") ?? ""),
      start_date: String(fd.get("start_date") ?? ""),
      end_date: String(fd.get("end_date") ?? ""),
      num_travelers: Number(fd.get("num_travelers") ?? 1),
      age: Number(fd.get("age") ?? 30),
      budget_tier: BUDGET_OPTIONS[budgetIdx].value,
      vibe: VIBE_OPTIONS[vibeIdx].value,
      dietary_notes: String(fd.get("dietary_notes") ?? ""),
      must_haves: String(fd.get("must_haves") ?? ""),
    };

    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.push(`/trips/${data.tripId}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-9">
      <Section n="01" title="Where & when">
        <div className="grid gap-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            name="destination"
            placeholder="e.g. Lisbon, Portugal"
            className={FIELD}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="start_date">Start date</Label>
            <Input id="start_date" name="start_date" type="date" className={FIELD} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end_date">End date</Label>
            <Input id="end_date" name="end_date" type="date" className={FIELD} required />
          </div>
        </div>
      </Section>

      <Section n="02" title="Who's going">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="num_travelers">Travelers</Label>
            <Input
              id="num_travelers"
              name="num_travelers"
              type="number"
              min={1}
              max={20}
              defaultValue={2}
              className={FIELD}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={1}
              max={120}
              defaultValue={30}
              className={FIELD}
              required
            />
          </div>
        </div>
      </Section>

      <Section n="03" title="Your style">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label>Budget</Label>
            <span className="rounded-full bg-brand-wash px-2.5 py-0.5 font-mono text-xs font-medium text-brand-deep">
              {BUDGET_OPTIONS[budgetIdx].label}
            </span>
          </div>
          <Slider
            value={budgetIdx}
            onValueChange={(v) => setBudgetIdx(v as number)}
            min={0}
            max={2}
            step={1}
          />
          <div className="flex justify-between text-xs text-slate">
            {BUDGET_OPTIONS.map((o) => (
              <span key={o.value}>{o.label}</span>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label>Vibe</Label>
            <span className="rounded-full bg-brand-wash px-2.5 py-0.5 font-mono text-xs font-medium text-brand-deep">
              {VIBE_OPTIONS[vibeIdx].label}
            </span>
          </div>
          <Slider
            value={vibeIdx}
            onValueChange={(v) => setVibeIdx(v as number)}
            min={0}
            max={2}
            step={1}
          />
          <div className="flex justify-between text-xs text-slate">
            {VIBE_OPTIONS.map((o) => (
              <span key={o.value}>{o.label}</span>
            ))}
          </div>
        </div>
      </Section>

      <Section n="04" title="Preferences" hint="optional">
        <div className="grid gap-2">
          <Label htmlFor="dietary_notes">Dietary notes</Label>
          <Textarea
            id="dietary_notes"
            name="dietary_notes"
            placeholder="e.g. one vegetarian, no shellfish"
            className="min-h-20"
            rows={2}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="must_haves">Must-haves</Label>
          <Textarea
            id="must_haves"
            name="must_haves"
            placeholder="e.g. a sunset viewpoint, a food market"
            className="min-h-20"
            rows={2}
          />
        </div>
      </Section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="h-12 w-full text-base">
        {loading ? "Planning your trip…" : "Plan my trip →"}
      </Button>
      {loading && (
        <p className="-mt-4 text-center text-sm text-slate">
          Claude is building your day-by-day itinerary — this can take up to a
          minute.
        </p>
      )}
    </form>
  );
}
