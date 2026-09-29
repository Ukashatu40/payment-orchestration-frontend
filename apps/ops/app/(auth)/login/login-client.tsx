"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, ApiError } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ThemeToggle } from "@payflow/ui/theme-toggle";
import type { Theme } from "@payflow/ui/theme";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// A representative reading for each rail — illustrative, not live (this
// page renders before any session exists). Ordered India-first then
// Africa-first the way the router itself groups them by currency.
const RAILS: { name: string; readout: string; lit: "success" | "warning" | "neutral" }[] = [
  { name: "RAZORPAY", readout: "99.1%", lit: "success" },
  { name: "PAYU", readout: "98.4%", lit: "success" },
  { name: "UPI", readout: "99.8%", lit: "success" },
  { name: "STRIPE", readout: "97.6%", lit: "success" },
  { name: "PAYSTACK", readout: "98.9%", lit: "success" },
  { name: "FLUTTERWAVE", readout: "94.2%", lit: "warning" },
  { name: "INTERSWITCH", readout: "—", lit: "neutral" },
  { name: "OPAY", readout: "99.0%", lit: "success" },
];

const LAMP_DOT: Record<(typeof RAILS)[number]["lit"], string> = {
  success: "bg-success shadow-[0_0_6px_2px_var(--success)]",
  warning: "bg-warning shadow-[0_0_6px_2px_var(--warning)]",
  neutral: "bg-muted-foreground/40",
};

function RailPanel() {
  return (
    <div className="relative hidden w-[26rem] shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-card px-10 py-10 lg:flex">
      <div className="flex items-center gap-2.5">
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="9.5" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="11" cy="11" r="3" fill="var(--primary)" />
        </svg>
        <span className="font-data text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Switchboard
        </span>
      </div>

      <div>
        <h2 className="font-display text-2xl font-semibold leading-tight text-foreground">
          Eight rails.
          <br />
          One route, every time.
        </h2>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
          PayFlow scores every gateway on latency and success rate, then
          routes each payment to the healthiest one — failing over the
          instant a rail degrades.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {RAILS.map((rail) => (
          <div
            key={rail.name}
            className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-background px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-data truncate text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
                {rail.name}
              </span>
              <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${LAMP_DOT[rail.lit]}`} />
            </div>
            <span className="font-data text-sm font-medium text-foreground">{rail.readout}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const [formError, setFormError] = React.useState<string | null>(null);

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login.mutateAsync(values);
      const next = searchParams.get("next") ?? "/overview";
      router.push(next);
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Unable to log in. Please try again.",
      );
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 font-display text-xl font-semibold">Sign in</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Operations console — routing, gateway health and reconciliation.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            className="h-10 rounded-[var(--radius)] border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" role="alert" className="text-xs text-danger">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-10 rounded-[var(--radius)] border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" role="alert" className="text-xs text-danger">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={login.isPending} className="mt-2">
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export function LoginPageClient({ theme }: { theme: Theme }) {
  return (
    <main className="flex min-h-screen">
      <RailPanel />
      <div className="relative flex flex-1 items-center justify-center p-6">
        <ThemeToggle theme={theme} className="absolute right-6 top-6" />
        <React.Suspense fallback={null}>
          <LoginForm />
        </React.Suspense>
      </div>
    </main>
  );
}
