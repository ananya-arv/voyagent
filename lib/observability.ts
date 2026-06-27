// Safe Sentry capture that works in the Next runtime (routes, Eve tools) and
// degrades to a no-op when Sentry isn't available (e.g. a plain tsx script).
export async function captureError(
  err: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(err, context ? { extra: context } : undefined);
  } catch {
    // Sentry unavailable — fall back to console so the error isn't swallowed.
    console.error("[voyagent] captured error:", err, context ?? "");
  }
}
