import Link from "next/link";
import { cardProfiles } from "@/data/card-profiles";
import { researchers } from "@/data/researchers";
import { telltales } from "@/data/telltales";

export default function HomePage() {
  return (
    <div>
      <section className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-5 pb-16 pt-10">
        <div className="pointer-events-none absolute right-[4%] top-[12%] hidden h-72 w-52 animate-floaty rounded-[1.4rem] border border-mint/25 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-950 shadow-glow sm:block">
          <div className="holo-sheen absolute inset-3 rounded-[1rem] border border-foam/10 bg-[radial-gradient(circle_at_30%_20%,rgba(61,255,224,0.25),transparent_45%),linear-gradient(160deg,#1a2740,#0b1220)]" />
          <p className="absolute bottom-5 left-0 right-0 text-center font-display text-sm tracking-[0.25em] text-mint/80">
            AUTH
          </p>
        </div>

        <p className="animate-rise font-display text-6xl leading-[0.9] tracking-tight text-foam sm:text-8xl md:text-9xl">
          HoloCheck
        </p>
        <h1
          className="animate-rise mt-6 max-w-xl font-display text-3xl leading-tight text-foam/95 sm:text-4xl"
          style={{ animationDelay: "120ms" }}
        >
          Spot fake Pokémon cards like the collectors who write the guides.
        </h1>
        <p
          className="animate-rise mt-5 max-w-lg text-lg text-foam/65"
          style={{ animationDelay: "220ms" }}
        >
          Research-backed telltales, card-specific fake profiles, and a $1
          guided check — or $5 for ten.
        </p>
        <div
          className="animate-rise mt-8 flex flex-wrap gap-3"
          style={{ animationDelay: "320ms" }}
        >
          <Link
            href="/check"
            className="rounded-full bg-mint px-7 py-3.5 font-semibold text-ink-950 transition hover:brightness-110"
          >
            Check a card — $1
          </Link>
          <Link
            href="/database"
            className="rounded-full border border-foam/20 px-7 py-3.5 text-foam/85 transition hover:border-mint/40 hover:text-mint"
          >
            Browse the database
          </Link>
        </div>
      </section>

      <section className="border-t border-foam/10 bg-ink-950/40 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl text-foam sm:text-4xl">
            Built from community research
          </h2>
          <p className="mt-3 max-w-2xl text-foam/65">
            Seeded from the r/GengarMasterSet Masaki Gengar counterfeit guide and
            cross-checked against TCGplayer, Hardcore Collectors, PokéWallet, FROM
            JAPAN, TCGrader, and more.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Feature
              title={`${telltales.length} telltales`}
              body="Fonts, kanji, energy icons, holo patterns, card backs, light/core checks, and market risk flags — weighted for scoring."
            />
            <Feature
              title={`${cardProfiles.length} card profiles`}
              body="Extreme-risk targets first: Masaki Gengar, Base Charizard, Illustrator, Black Star promos, modern chase."
            />
            <Feature
              title={`${researchers.length} researchers`}
              body="Directory of communities, guide authors, graders, and services so you can escalate inconclusive cards."
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-3xl text-foam sm:text-4xl">
              How a $1 check works
            </h2>
            <ol className="mt-6 space-y-4 text-foam/70">
              <li>
                <span className="text-mint">1.</span> Pick a researched profile
                (or general checklist).
              </li>
              <li>
                <span className="text-mint">2.</span> Add front / back / macro
                photos for your own reference.
              </li>
              <li>
                <span className="text-mint">3.</span> Mark each telltale pass,
                fail, or unsure.
              </li>
              <li>
                <span className="text-mint">4.</span> Unlock the full weighted
                report for $1 — or use a $5 pass (10 credits).
              </li>
            </ol>
            <Link
              href="/check"
              className="mt-8 inline-flex rounded-full bg-foam px-6 py-3 font-semibold text-ink-950"
            >
              Start free preview
            </Link>
          </div>
          <div className="rounded-3xl border border-foam/10 bg-ink-800/50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-foam/45">
              Featured profile
            </p>
            <h3 className="mt-2 font-display text-2xl text-foam">
              Masaki Gengar fakes
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foam/70">
              <li>Muted background blues/greens</li>
              <li>Wrong evolution-box color/font</li>
              <li>Teeth cleaned up vs dirty authentic art</li>
              <li>Wrong LV.40 font & energy shading</li>
              <li>Katakana カ instead of kanji 力</li>
            </ul>
            <p className="mt-4 text-xs text-foam/45">
              Source: SakuretsuSensei, r/GengarMasterSet
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-foam/10 bg-ink-800/40 p-6">
      <h3 className="font-display text-2xl text-mint">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-foam/65">{body}</p>
    </div>
  );
}
