"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_COOKIE_NAME, type Theme } from "./theme";
import { cn } from "./utils";

export interface ThemeToggleProps {
  theme: Theme;
  className?: string;
}

/**
 * Flips `data-theme` on <html> immediately (no flash) and persists the
 * choice in a plain, non-httpOnly cookie — it's a display preference, not a
 * secret, so the root layout can read it server-side on the next request
 * and render the right theme before first paint.
 */
export function ThemeToggle({ theme, className }: ThemeToggleProps) {
  const [current, setCurrent] = React.useState(theme);

  function toggle() {
    const next: Theme = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setCurrent(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={current === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-[var(--radius)] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {current === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
