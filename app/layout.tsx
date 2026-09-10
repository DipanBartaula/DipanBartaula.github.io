import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";
import CardSpotlight from "@/components/CardSpotlight";
import CursorGlow from "@/components/CursorGlow";
import "./globals.css";

// Runs synchronously as the parser reaches it — before React/hydration is
// even loaded — so a repeat-session visitor (or prefers-reduced-motion) skips
// the boot curtain with zero flash, regardless of how long the JS bundle
// takes to arrive and hydrate.
const BOOT_SKIP_SCRIPT = `
(function () {
  try {
    if (sessionStorage.getItem("intro-shown")) {
      document.getElementById("boot-curtain").setAttribute("data-skip", "true");
    } else {
      sessionStorage.setItem("intro-shown", "1");
    }
  } catch (e) {}
})();
`;

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sourcesans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dipan Bartaula",
  description:
    "AI & simulation research engineer — generative models, differentiable physics, and agentic systems.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${jbmono.variable} ${sourceSans.variable} font-sans antialiased`}
      >
        <div id="boot-curtain" aria-hidden="true" suppressHydrationWarning>
          <span className="boot-text">
            <span style={{ color: "var(--accent)" }}>$</span> initializing simulation
            <span className="boot-cursor">_</span>
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SKIP_SCRIPT }} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CardSpotlight />
          <CursorGlow />
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
