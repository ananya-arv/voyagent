import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  /* config options here */
};

// withEve mounts the Eve agent's /eve/v1/* routes on this origin (so the chat
// UI is same-origin) and boots the Eve dev server alongside `next dev`.
// withSentryConfig wraps the result; source-map upload runs only when
// SENTRY_AUTH_TOKEN/org/project are set, otherwise it's skipped.
export default withSentryConfig(withEve(nextConfig), {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
