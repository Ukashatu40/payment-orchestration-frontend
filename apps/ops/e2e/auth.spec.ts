import { expect, test } from "@playwright/test";

// These specs need no backend: they cover the optimistic proxy redirect and
// client-side (zod) validation only. Real login flows are verified manually
// against a live backend.
test("logged-out visit to a dashboard route redirects to /login", async ({ page }) => {
  await page.goto("/overview");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "PayFlow Ops" })).toBeVisible();
});

test("submitting an empty login form shows validation errors", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
});
