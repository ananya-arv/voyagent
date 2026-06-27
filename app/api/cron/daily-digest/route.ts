import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDigestsForDate } from "@/lib/supabase/queries";
import { DailyDigestEmail } from "@/emails/DailyDigestEmail";
import { appBaseUrl } from "@/lib/itinerary-utils";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";
export const maxDuration = 120;

function tomorrowISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = tomorrowISO();

  let digests;
  try {
    digests = await getDigestsForDate(date);
  } catch (err) {
    await captureError(err, { route: "daily-digest", date });
    return NextResponse.json({ error: "Failed to query trips" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured (RESEND_API_KEY missing)." },
      { status: 500 },
    );
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "Voyagent <onboarding@resend.dev>";
  const baseUrl = appBaseUrl();

  let sent = 0;
  let failed = 0;
  for (const d of digests) {
    if (!d.user.email) continue;
    try {
      const { error } = await resend.emails.send({
        from,
        to: d.user.email,
        subject: `Tomorrow in ${d.trip.destination} — your plan`,
        react: DailyDigestEmail({
          trip: d.trip,
          events: d.events,
          date,
          baseUrl,
        }),
      });
      if (error) throw new Error(error.message);
      sent += 1;
    } catch (err) {
      failed += 1;
      await captureError(err, { route: "daily-digest", tripId: d.trip.id });
    }
  }

  return NextResponse.json({ date, trips: digests.length, sent, failed });
}

// GET: Vercel Cron. POST: manual invocation. Both require the bearer secret.
export const GET = handle;
export const POST = handle;
