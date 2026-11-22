import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import GameToaster from "@/components/GameToaster";
import TopBar from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Nomad Pocketbook",
  description:
    "Compare monthly weather, work across time zones and price your next move. Scratch off the countries you have really visited.",
  appleWebApp: { capable: true, title: "Pocketbook", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf3e6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1424" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full">
        <TopBar />
        <main className="mx-auto w-full max-w-xl px-4 pt-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
        <GameToaster />
      </body>
    </html>
  );
}
