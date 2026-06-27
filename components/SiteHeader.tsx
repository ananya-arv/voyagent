"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  const { user, isLoading } = useUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          ✈️ Voyagent
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {isLoading ? null : user ? (
            <>
              <Link href="/trips" className="text-muted-foreground hover:text-foreground">
                My trips
              </Link>
              <Link href="/plan" className="text-muted-foreground hover:text-foreground">
                Plan
              </Link>
              <Link href="/chat" className="text-muted-foreground hover:text-foreground">
                Chat
              </Link>
              <span className="hidden text-muted-foreground sm:inline">
                {user.email ?? user.name}
              </span>
              <a href="/auth/logout" className={buttonVariants({ size: "sm", variant: "outline" })}>
                Log out
              </a>
            </>
          ) : (
            <a href="/auth/login" className={buttonVariants({ size: "sm" })}>
              Log in
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
