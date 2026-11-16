import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter_Tight, Marcellus } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Tight grotesk for the caption under the signature, labels, body and UI.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

// Crisp, low-contrast glyphic serif for headlines (upright only).
const displaySerif = Marcellus({
  variable: "--font-serif-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shahid Mollick",
  description: "Portfolio of Shahid Mollick",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
