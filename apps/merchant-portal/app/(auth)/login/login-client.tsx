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

function ManifestPanel() {
  return (
    <div className="relative hidden w-[24rem] shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-card px-10 py-10 lg:flex">
      <div className="flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10.5" stroke="var(--primary)" strokeWidth="1.5" />
          <path
            d="M8 12.5 10.5 15 16 9"
            stroke="var(--primary)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-display text-lg font-semibold tracking-tight">PayFlow</span>
      </div>

      <div>
        <h2 className="font-display text-2xl italic leading-snug text-foreground">
          Every payment, accounted for.
        </h2>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
          A clear record of what was paid, on which rail, and when it
          settled — no matter how many gateways it took to get there.
        </p>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-background p-4">
        <div className="flex items-start justify-between gap-3 border-b border-dashed border-border pb-3">
          <div>
            <p className="font-data text-xs text-muted-foreground">order-84213</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Paystack · NGN</p>
          </div>
          {/* The one place seal-gold appears: an ink stamp on a captured
              payment, not the status system's own success color (that stays
              green everywhere it means "healthy" — this is a decorative
              seal, not a repainted status badge). */}
          <span className="relative inline-flex -rotate-6 items-center gap-1.5 rounded-full border-2 border-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="m2.5 6.5 2 2 5-5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Captured
          </span>
        </div>
        <p className="font-display pt-3 text-2xl font-semibold tabular-nums text-foreground">
          ₦12,400.00
        </p>
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
  const wrongAccount = searchParams.get("reason") === "wrong-account";

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
    <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-card p-8 shadow-sm">
      <h1 className="font-display mb-1 text-xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-muted-foreground">Sign in to your PayFlow account.</p>

      {wrongAccount ? (
        <p role="alert" className="mb-4 rounded-[var(--radius)] bg-warning/10 p-3 text-sm text-warning">
          That account isn&apos;t a merchant account, so it can&apos;t access this portal. Sign
          in with your merchant account instead.
        </p>
      ) : null}

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
    <main className="flex min-h-screen bg-muted/30">
      <ManifestPanel />
      <div className="relative flex flex-1 items-center justify-center p-6">
        <ThemeToggle theme={theme} className="absolute right-6 top-6" />
        <React.Suspense fallback={null}>
          <LoginForm />
        </React.Suspense>
      </div>
    </main>
  );
}
