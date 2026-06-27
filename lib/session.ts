import "server-only";
import { auth0 } from "@/lib/auth0";

export interface CurrentUser {
  sub: string;
  email: string;
  name?: string;
}

/** Resolve the current Auth0 user from the session, or null if unauthenticated. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return null;
  return {
    sub: session.user.sub as string,
    email: (session.user.email as string | undefined) ?? "",
    name: session.user.name as string | undefined,
  };
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Like getCurrentUser but throws UnauthorizedError when not signed in. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
