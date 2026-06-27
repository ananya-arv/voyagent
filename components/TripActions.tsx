"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";

export function TripActions({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [emailState, setEmailState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteState, setDeleteState] = useState<
    "idle" | "deleting" | "error"
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

  async function deleteTrip() {
    setDeleteState("deleting");
    try {
      const res = await fetch(`/api/delete-trip/${tripId}`, { method: "POST" });
      if (!res.ok) {
        setDeleteState("error");
        return;
      }
      router.push("/trips");
      router.refresh();
    } catch {
      setDeleteState("error");
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

      <span className="ml-auto flex items-center gap-2">
        {confirmingDelete ? (
          <>
            <span className="text-sm text-slate">Delete this trip?</span>
            <Button
              variant="destructive"
              onClick={deleteTrip}
              disabled={deleteState === "deleting"}
            >
              {deleteState === "deleting" ? "Deleting…" : "Yes, delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleteState === "deleting"}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
            🗑 Delete trip
          </Button>
        )}
      </span>

      {emailState === "error" && (
        <span className="w-full text-sm text-destructive">
          Could not send — check email config.
        </span>
      )}
      {deleteState === "error" && (
        <span className="w-full text-sm text-destructive">
          Could not delete the trip. Please try again.
        </span>
      )}
    </div>
  );
}
