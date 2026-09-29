export const THEME_COOKIE_NAME = "payflow_theme";

export type Theme = "light" | "dark";

export function resolveTheme(
  cookieValue: string | undefined,
  appDefault: Theme,
): Theme {
  return cookieValue === "light" || cookieValue === "dark" ? cookieValue : appDefault;
}
