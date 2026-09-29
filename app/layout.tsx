import type { Metadata } from "next";
import {
  Archivo,
  Newsreader,
  Source_Sans_3,
  JetBrains_Mono,
} from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeScript from "@/components/ThemeScript";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

/*
  Headline face. Loaded as a variable font, so one file covers every weight
  from 400 to 900 instead of shipping a separate file per weight. Italic is
  included for the hero's emphasized second line.
*/
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
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
      className={`${archivo.variable} ${newsreader.variable} ${sourceSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeScript />
        <CustomCursor />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-SFHY66M9X7" />
    </html>
  );
}
