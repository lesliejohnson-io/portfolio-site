import type { Metadata } from "next";
import {
  Archivo,
  Cormorant_Garamond,
  Source_Sans_3,
  JetBrains_Mono,
} from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeScript from "@/components/ThemeScript";
import "./globals.css";

/*
  Headline face. Loaded as a variable font, so one file covers every weight
  from 400 to 900 instead of shipping a separate file per weight. Italic is
  included for the hero's emphasized second line.

  No `weight` array on purpose. Naming weights swaps the variable file for one
  static instance per weight, which would cover 600/700/800 but drop the 500
  that `h1`-`h4` default to in globals.css. The variable axis already serves
  every weight WaveHero (700), LogoMark (600 and 800) and the headings ask for.
*/
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

/*
  The site's only serif, replacing Newsreader: the About lead paragraph at 400
  and the pull quotes on the Library page at 600. Italic only — both uses
  are italic, so there is no reason to ship the upright faces. Both weights are
  loaded rather than leaving the browser to synthesize the heavier one: faux
  bold smears a high-contrast serif like this, thickening the hairlines along
  with the stems.
*/
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "600"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leslie Johnson — Intelligent Systems Meet Human Design",
  description:
    "I design the human side of AI systems — so the products organizations build earn trust instead of losing it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${cormorantGaramond.variable} ${sourceSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/*
        Archivo's variable is redeclared here as well as on <html>. WaveHero and
        LogoMark read `--font-archivo` through inline styles, so the variable is
        pinned to the element they actually render inside.
      */}
      <body className={`${archivo.variable} min-h-full flex flex-col`}>
        <ThemeScript />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-SFHY66M9X7" />
    </html>
  );
}
