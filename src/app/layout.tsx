import { Nav } from "@/components/Nav";
import { Syne, Manrope } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HoloCheck — Spot fake Pokémon cards for $1",
  description:
    "Research-backed Pokémon card authenticity checklists, card-specific fake profiles, and researcher directory. $1 per card or $5 for 10 checks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} min-h-screen bg-ink-950 font-body text-foam antialiased`}
      >
        <div className="min-h-screen bg-card-haze">
          <div
            className="pointer-events-none fixed inset-0 bg-grid-faint opacity-40"
            style={{ backgroundSize: "48px 48px" }}
          />
          <Nav />
          <main className="relative z-10">{children}</main>
          <footer className="relative z-10 border-t border-foam/10 px-5 py-10 text-center text-sm text-foam/45">
            HoloCheck is an advisory tool built from public collector research — not
            a grading company or The Pokémon Company product.
          </footer>
        </div>
      </body>
    </html>
  );
}
