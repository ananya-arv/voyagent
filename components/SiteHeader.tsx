"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  const { user, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-lg text-background transition-transform duration-300 group-hover:-rotate-12">
            ✈
          </span>
          <span className="font-heading text-2xl font-semibold tracking-tight">
            Voyagent
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-[0.95rem]">
          {isLoading ? null : user ? (
            <>
              <Link
                href="/trips"
                className="rounded-lg px-3.5 py-2 text-slate transition-colors hover:bg-mist hover:text-ink"
              >
                My trips
              </Link>
              <Link
                href="/plan"
                className="rounded-lg px-3.5 py-2 text-slate transition-colors hover:bg-mist hover:text-ink"
              >
                Plan
              </Link>
              <Link
                href="/chat"
                className="rounded-lg px-3.5 py-2 text-slate transition-colors hover:bg-mist hover:text-ink"
              >
                Chat
              </Link>
              <span className="mx-2 hidden text-xs text-slate/70 sm:inline">
                {user.email ?? user.name}
              </span>
              <a
                href="/auth/logout"
                className={buttonVariants({ variant: "outline" })}
              >
                Log out
              </a>
            </>
          ) : (
            <a href="/auth/login" className={buttonVariants({})}>
              Log in
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
