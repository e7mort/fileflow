"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLedger } from "@/lib/credits";

const links = [
  { href: "/check", label: "Check a card" },
  { href: "/database", label: "Database" },
  { href: "/researchers", label: "Researchers" },
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const sync = () => setCredits(getLedger().credits);
    sync();
    window.addEventListener("holocheck-credits", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("holocheck-credits", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="relative z-20 border-b border-foam/10 bg-ink-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight text-foam transition group-hover:text-mint">
            HoloCheck
          </span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-foam/45 sm:inline">
            spot fakes
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-foam/75">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-mint"
            >
              {link.label}
            </Link>
          ))}
          <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-medium text-mint">
            {credits} credit{credits === 1 ? "" : "s"}
          </span>
        </nav>
      </div>
    </header>
  );
}
