"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function IntakeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState("mid");
  const [vibe, setVibe] = useState("relaxed");

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
      budget_tier: budget,
      vibe,
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
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          name="destination"
          placeholder="e.g. Lisbon, Portugal"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" name="end_date" type="date" required />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="num_travelers">Number of travelers</Label>
        <Input
          id="num_travelers"
          name="num_travelers"
          type="number"
          min={1}
          max={20}
          defaultValue={2}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label>Budget tier</Label>
        <Select value={budget} onValueChange={(v) => setBudget(v ?? "mid")}>
          <SelectTrigger>
            <SelectValue placeholder="Select budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="mid">Mid-range</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Vibe</Label>
        <RadioGroup
          value={vibe}
          onValueChange={(v) => setVibe((v as string) ?? "relaxed")}
          className="flex flex-wrap gap-4"
        >
          {["relaxed", "packed", "adventurous"].map((v) => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem value={v} id={`vibe-${v}`} />
              <Label htmlFor={`vibe-${v}`} className="font-normal capitalize">
                {v}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dietary_notes">Dietary notes (optional)</Label>
        <Textarea
          id="dietary_notes"
          name="dietary_notes"
          placeholder="e.g. one vegetarian, no shellfish"
          rows={2}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="must_haves">Must-haves (optional)</Label>
        <Textarea
          id="must_haves"
          name="must_haves"
          placeholder="e.g. a sunset viewpoint, a food market"
          rows={2}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Planning your trip…" : "Plan my trip"}
      </Button>
      {loading && (
        <p className="text-center text-sm text-muted-foreground">
          Claude is building your day-by-day itinerary — this can take up to a
          minute.
        </p>
      )}
    </form>
  );
}
