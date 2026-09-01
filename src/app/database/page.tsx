import { telltales } from "@/data/telltales";
import { cardProfiles } from "@/data/card-profiles";
import { sources } from "@/data/sources";
import { getSource } from "@/data/sources";
import Link from "next/link";

export default function DatabasePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl text-foam">Authenticity database</h1>
      <p className="mt-4 max-w-2xl text-foam/65">
        Structured telltales and card-specific fake profiles compiled from public
        collector research. This is the brain behind each $1 check.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-3xl text-foam">Card profiles</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {cardProfiles.map((profile) => (
            <article
              key={profile.id}
              className="rounded-3xl border border-foam/10 bg-ink-800/50 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-2xl text-foam">{profile.name}</h3>
                <span className="text-xs uppercase tracking-widest text-gold">
                  {profile.riskLevel}
                </span>
              </div>
              <p className="mt-1 text-sm text-foam/55">
                {profile.set} · {profile.language} · {profile.era}
              </p>
              <p className="mt-3 text-sm text-foam/70">{profile.whyTargeted}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foam/65">
                {profile.specificNotes.slice(0, 5).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <Link
                href="/check"
                className="mt-4 inline-block text-sm text-mint underline"
              >
                Run this profile →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl text-foam">Universal telltales</h2>
        <div className="mt-6 space-y-3">
          {telltales.map((t) => (
            <details
              key={t.id}
              className="group rounded-2xl border border-foam/10 bg-ink-800/40 p-4 open:border-mint/30"
            >
              <summary className="cursor-pointer list-none font-display text-xl text-foam">
                <span className="mr-3 text-xs uppercase tracking-widest text-foam/40">
                  {t.category}
                </span>
                {t.title}
                <span className="ml-2 text-sm text-foam/40">w{t.weight}</span>
              </summary>
              <div className="mt-3 space-y-2 text-sm text-foam/70">
                <p>{t.howToCheck}</p>
                <p>
                  <span className="text-mint">Real:</span> {t.realSign}
                </p>
                <p>
                  <span className="text-signal">Fake:</span> {t.fakeSign}
                </p>
                <p className="text-foam/45">
                  Sources:{" "}
                  {t.sources
                    .map((id) => getSource(id)?.title ?? id)
                    .join(" · ")}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl text-foam">Cited sources</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {sources.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-foam/10 bg-ink-800/40 p-4 transition hover:border-mint/35"
            >
              <p className="text-xs uppercase tracking-widest text-foam/40">
                {s.kind} · {s.publisher}
              </p>
              <p className="mt-1 font-display text-lg text-foam">{s.title}</p>
              <p className="mt-2 text-sm text-foam/60">{s.notes}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
