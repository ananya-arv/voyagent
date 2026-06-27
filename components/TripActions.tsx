"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

export function TripActions({ tripId }: { tripId: string }) {
  const [emailState, setEmailState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function sendEmail() {
    setEmailState("sending");
    try {
      const res = await fetch(`/api/send-itinerary/${tripId}`, { method: "POST" });
      setEmailState(res.ok ? "sent" : "error");
    } catch {
      setEmailState("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Direct link so the browser downloads the .ics with the session cookie */}
      <a
        href={`/api/export-ics/${tripId}`}
        className={buttonVariants({ variant: "outline" })}
      >
        Download calendar
      </a>
      <Button onClick={sendEmail} disabled={emailState === "sending"}>
        {emailState === "sending"
          ? "Sending…"
          : emailState === "sent"
            ? "Sent ✓"
            : "Email itinerary"}
      </Button>
      {emailState === "error" && (
        <span className="text-sm text-destructive">
          Could not send — check email config.
        </span>
      )}
    </div>
  );
}
