import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { ApiQueryClientProvider } from "@payflow/api-client";
import { THEME_COOKIE_NAME, resolveTheme } from "@payflow/ui/theme";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Space Grotesk — geometric, slightly technical — carries section headers
// and hero numbers only. Ops' body/UI text stays in the more legible Plex
// Sans; this is a controlled accent voice, not the workhorse font.
const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PayFlow Ops",
  description: "Internal operations dashboard for PayFlow",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, "dark");

  return (
    <html
      lang="en"
      data-theme={theme}
      data-density="compact"
      className={`${plexSans.variable} ${plexMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApiQueryClientProvider>{children}</ApiQueryClientProvider>
      </body>
    </html>
  );
}
