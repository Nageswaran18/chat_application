"use client";

import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, ThemeToggle } from "@/components/ui";
import { users, ACCESS_TOKEN_KEY } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [checkingToken, setCheckingToken] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user already has a valid token, redirect to dashboard (don't show login on refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setCheckingToken(false);
      return;
    }
    users.getMe().then((result) => {
      setCheckingToken(false);
      if (result.ok) {
        router.replace("/dashboard");
      }
      // If 401/invalid, clear token and stay on login
      if (!result.ok && result.error.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    });
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await users.login(email, password);

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      const token = result.data.access_token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="app-shell flex items-center justify-center px-4 py-8 min-h-screen bg-zinc-100 dark:bg-zinc-950 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
        <section className="text-zinc-800 dark:text-zinc-100">
          <p className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-200/80 dark:bg-zinc-900/40 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Realtime chat · Secure by default
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Welcome back to your{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
              realtime inbox
            </span>
          </h1>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
            Log in to pick up conversations where you left off, share files, and
            jump into calls instantly.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-200/60 dark:bg-zinc-900/60 px-3 py-1">
              <span className="inline-block h-5 w-5 rounded-full bg-emerald-500/80" />
              End-to-end ready
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-200/60 dark:bg-zinc-900/60 px-3 py-1">
              <span className="inline-block h-5 w-5 rounded-full bg-emerald-500/80" />
              Presence & typing indicators
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/90 backdrop-blur px-6 py-7 md:px-8 md:py-8 shadow-xl">
          <header className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Sign in
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 text-sm">
              Use the credentials you registered with to access your workspace.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightAction={
                <button
                  type="button"
                  className="text-[0.7rem] text-zinc-500 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
                >
                  Forgot?
                </button>
              }
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-500/10 px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              loadingLabel="Signing you in…"
              className="mt-1 min-h-12 h-12 text-sm font-medium"
            >
              Continue to dashboard
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            By continuing you agree to our{" "}
            <span className="underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-500">
              Terms
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-500">
              Privacy Policy
            </span>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
