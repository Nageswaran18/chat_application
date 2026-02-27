"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!API_BASE_URL) {
      setError("Client misconfigured: missing NEXT_PUBLIC_API_URL.");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = "Invalid email or password.";
        try {
          const data = await response.json();
          if (data?.detail && typeof data.detail === "string") {
            message = data.detail;
          }
        } catch {
          // ignore JSON parse errors and use default message
        }
        setError(message);
        return;
      }

      await response.json().catch(() => null);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell flex items-center justify-center px-4 py-8 min-h-screen bg-[#020617]">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
        <section className="text-slate-100">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/40 px-3 py-1 text-xs font-medium text-slate-300 mb-5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Realtime chat · Secure by default
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Welcome back to your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
              realtime inbox
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-md mb-6">
            Log in to pick up conversations where you left off, share files, and
            jump into calls instantly.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1">
              <span className="inline-block h-5 w-5 rounded-full bg-indigo-500/80" />
              End-to-end ready
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1">
              <span className="inline-block h-5 w-5 rounded-full bg-emerald-500/80" />
              Presence & typing indicators
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto rounded-2xl border border-slate-700/50 bg-slate-900/90 backdrop-blur px-6 py-7 md:px-8 md:py-8 shadow-xl">
          <header className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-50">
              Sign in
            </h2>
            <p className="text-slate-400 mt-1.5 text-sm">
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
                  className="text-[0.7rem] text-slate-300 hover:text-slate-100 transition-colors"
                >
                  Forgot?
                </button>
              }
            />

            {error && (
              <p className="text-sm text-red-400 rounded-lg bg-red-500/10 px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              loadingLabel="Signing you in…"
              className="mt-1"
            >
              Continue to dashboard
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            By continuing you agree to our{" "}
            <span className="underline underline-offset-4 decoration-slate-500/70">
              Terms
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-4 decoration-slate-500/70">
              Privacy Policy
            </span>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
