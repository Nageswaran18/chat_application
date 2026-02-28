"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ACCESS_TOKEN_KEY } from "@/lib/api";

/**
 * Home: redirect to dashboard if logged in, otherwise to login.
 * In production this gives a single entry point (e.g. yourdomain.com → login or chat).
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
    </div>
  );
}
