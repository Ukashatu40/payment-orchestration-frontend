import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ApiQueryClientProvider } from "@payflow/api-client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayFlow Ops",
  description: "Internal operations dashboard for PayFlow",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-density="compact"
    >
      <body className="min-h-full flex flex-col">
        <ApiQueryClientProvider>{children}</ApiQueryClientProvider>
      </body>
    </html>
  );
}
