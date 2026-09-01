"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLedger, purchasePlan } from "@/lib/credits";

export default function PricingPage() {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const sync = () => setCredits(getLedger().credits);
    sync();
    window.addEventListener("holocheck-credits", sync);
    return () => window.removeEventListener("holocheck-credits", sync);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-5xl text-foam">Simple pricing</h1>
      <p className="mt-4 max-w-2xl text-foam/65">
        Cheap enough that checking a suspect listing feels obvious. Preview scores
        stay free; full reports spend credits.
      </p>
      <p className="mt-3 text-sm text-mint">You have {credits} credit(s).</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Plan
          name="Single check"
          price="$1"
          detail="1 full authenticity report"
          bullets={[
            "Weighted telltale breakdown",
            "Failed vs passed reasons",
            "Researcher next steps",
          ]}
          cta="Add $1 credit"
          onBuy={() => purchasePlan("single")}
        />
        <Plan
          name="Collector pass"
          price="$5"
          detail="10 full reports"
          bullets={[
            "Best for buying sessions",
            "Same report depth as $1 checks",
            "Credits stored on this device (demo)",
          ]}
          cta="Buy $5 pass"
          featured
          onBuy={() => purchasePlan("pass")}
        />
      </div>

      <p className="mt-8 text-sm text-foam/50">
        Demo mode grants credits instantly — Stripe/Apple Pay can be wired next
        without changing the $1 / $5 model.{" "}
        <Link href="/check" className="text-mint underline">
          Run a check
        </Link>
      </p>
    </div>
  );
}

function Plan({
  name,
  price,
  detail,
  bullets,
  cta,
  onBuy,
  featured,
}: {
  name: string;
  price: string;
  detail: string;
  bullets: string[];
  cta: string;
  onBuy: () => void;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        featured
          ? "border-mint/40 bg-mint/10 shadow-glow"
          : "border-foam/10 bg-ink-800/50"
      }`}
    >
      <h2 className="font-display text-3xl text-foam">{name}</h2>
      <p className="mt-2 font-display text-5xl text-mint">{price}</p>
      <p className="mt-1 text-foam/60">{detail}</p>
      <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-foam/70">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onBuy}
        className="mt-6 rounded-full bg-foam px-5 py-3 font-semibold text-ink-950"
      >
        {cta}
      </button>
    </div>
  );
}
