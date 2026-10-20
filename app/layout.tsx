import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EventCraft AI — GenAI celebration & event planner",
  description:
    "Plan weddings, birthdays and community events with AI-generated budgets, dated timelines, vendor checklists and personalized ideas.",
  applicationName: "EventCraft AI",
  openGraph: {
    title: "EventCraft AI — your AI event co-pilot",
    description:
      "Budgets, timelines, vendor checklists and personalized ideas for weddings, birthdays and community events.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1C110C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${jakarta.variable} ${caveat.variable}`}>
      <body>
        <a href="#main-content" className="sr-only-focusable">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
