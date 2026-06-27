import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Auth0 SDK v4 client. Routes (/auth/login, /auth/logout, /auth/callback, ...)
// are mounted by middleware.ts. Values are passed explicitly with placeholder
// fallbacks so the app boots without real credentials — login only works once
// the real AUTH0_* / APP_BASE_URL values are set in .env.local.
export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN ?? "example.us.auth0.com",
  clientId: process.env.AUTH0_CLIENT_ID ?? "placeholder-client-id",
  clientSecret: process.env.AUTH0_CLIENT_SECRET ?? "placeholder-client-secret",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  secret: process.env.AUTH0_SECRET ?? "0".repeat(64),
});
