import { researchers } from "@/data/researchers";

export default function ResearchersPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl text-foam">Researchers & helpers</h1>
      <p className="mt-4 max-w-2xl text-foam/65">
        People and places already documenting fakes online. Use them to grow the
        HoloCheck database — and escalate when a checklist is inconclusive.
      </p>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {researchers.map((r) => (
          <article
            key={r.id}
            className="rounded-3xl border border-foam/10 bg-ink-800/50 p-5"
          >
            <p className="text-xs uppercase tracking-widest text-mint/80">
              {r.type}
            </p>
            <h2 className="mt-1 font-display text-2xl text-foam">{r.name}</h2>
            <p className="mt-2 text-sm text-foam/70">{r.focus}</p>
            <p className="mt-3 text-sm text-foam/60">
              <span className="text-foam/85">How:</span> {r.howToEngage}
            </p>
            <p className="mt-2 text-sm text-foam/60">
              <span className="text-foam/85">Cost:</span> {r.cost}
            </p>
            <p className="mt-2 text-sm text-foam/50">{r.notes}</p>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-mint underline"
            >
              Open source →
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
