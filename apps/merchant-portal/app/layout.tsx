import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
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
  weight: ["400", "500"],
});

// Fraunces — a serif with real print/optical-size character, reads like ink
// on a statement. Headings and hero amounts only; body/controls stay in the
// quieter Plex Sans.
const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "PayFlow",
  description: "View your transactions, manage refunds, and update your account.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, "light");

  return (
    <html
      lang="en"
      data-theme={theme}
      data-density="comfortable"
      className={`${plexSans.variable} ${plexMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApiQueryClientProvider>{children}</ApiQueryClientProvider>
      </body>
    </html>
  );
}
