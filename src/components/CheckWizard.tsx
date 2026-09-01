"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cardProfiles } from "@/data/card-profiles";
import { getTelltale } from "@/data/telltales";
import { purchasePlan, pushHistory, spendCredit, getLedger } from "@/lib/credits";
import { scoreCheck, type CheckAnswer, type ScoreResult } from "@/lib/scoring";

type Step = "pick" | "photos" | "checklist" | "result";

const verdictCopy: Record<
  ScoreResult["verdict"],
  { label: string; color: string }
> = {
  likely_authentic: { label: "Likely authentic", color: "text-mint" },
  needs_review: { label: "Needs expert review", color: "text-gold" },
  suspicious: { label: "Suspicious", color: "text-signal" },
  likely_fake: { label: "Likely fake", color: "text-signal" },
};

export function CheckWizard() {
  const [step, setStep] = useState<Step>("pick");
  const [profileId, setProfileId] = useState("masaki-gengar");
  const [answers, setAnswers] = useState<Record<string, CheckAnswer>>({});
  const [photos, setPhotos] = useState<{ front?: string; back?: string; macro?: string }>(
    {},
  );
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState("");

  const profile = useMemo(
    () => cardProfiles.find((p) => p.id === profileId)!,
    [profileId],
  );

  const telltales = useMemo(
    () =>
      profile.telltaleIds
        .map((id) => getTelltale(id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [profile],
  );

  function onPhoto(kind: "front" | "back" | "macro", file?: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [kind]: url }));
  }

  function runScore() {
    const scored = scoreCheck(profileId, answers);
    setResult(scored);
    setUnlocked(false);
    setCredits(getLedger().credits);
    setStep("result");
    pushHistory({
      id: crypto.randomUUID(),
      profileId,
      verdict: scored.verdict,
      score: scored.score,
      at: new Date().toISOString(),
      unlocked: false,
    });
  }

  function unlock() {
    setError("");
    setCredits(getLedger().credits);
    if (getLedger().credits < 1) {
      setError("No credits left — buy a $1 check or $5 pass first.");
      return;
    }
    if (!spendCredit()) {
      setError("Could not spend a credit.");
      return;
    }
    setUnlocked(true);
    setCredits(getLedger().credits);
  }

  function buy(plan: "single" | "pass") {
    purchasePlan(plan);
    setCredits(getLedger().credits);
    setError("");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-8 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-foam/45">
        {(["pick", "photos", "checklist", "result"] as Step[]).map((s, i) => (
          <li
            key={s}
            className={`rounded-full border px-3 py-1 ${
              step === s
                ? "border-mint/50 bg-mint/10 text-mint"
                : "border-foam/15"
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === "pick" && (
        <section className="animate-rise space-y-6">
          <h1 className="font-display text-4xl text-foam sm:text-5xl">
            Which card are we sniffing?
          </h1>
          <p className="max-w-2xl text-foam/70">
            Start with a researched counterfeit profile. Masaki Gengar is seeded
            from the r/GengarMasterSet guide; more profiles expand from community
            researchers.
          </p>
          <div className="grid gap-3">
            {cardProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProfileId(p.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  profileId === p.id
                    ? "border-mint/50 bg-mint/10 shadow-glow"
                    : "border-foam/10 bg-ink-800/60 hover:border-foam/25"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-xl text-foam">{p.name}</span>
                  <span className="text-xs uppercase tracking-widest text-gold">
                    {p.riskLevel} risk
                  </span>
                </div>
                <p className="mt-1 text-sm text-foam/60">
                  {p.set} · {p.language} · {p.era}
                </p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep("photos")}
            className="rounded-full bg-mint px-6 py-3 font-medium text-ink-950 transition hover:brightness-110"
          >
            Continue with photos
          </button>
        </section>
      )}

      {step === "photos" && (
        <section className="animate-rise space-y-6">
          <h1 className="font-display text-4xl text-foam">Add clear photos</h1>
          <p className="text-foam/70">
            Photos stay on your device for this demo. Shoot front, back, and a
            text/energy macro under a single light — the same way authenticity
            megathreads ask.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["front", "back", "macro"] as const).map((kind) => (
              <label
                key={kind}
                className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-foam/20 bg-ink-800/50 p-3 text-center hover:border-mint/40"
              >
                <span className="mb-2 text-xs uppercase tracking-widest text-foam/50">
                  {kind}
                </span>
                {photos[kind] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photos[kind]}
                    alt={kind}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-sm text-foam/60">Tap to upload</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPhoto(kind, e.target.files?.[0])}
                />
              </label>
            ))}
          </div>
          <div className="rounded-2xl border border-foam/10 bg-ink-800/40 p-4 text-sm text-foam/70">
            <p className="font-medium text-foam">Profile notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {profile.specificNotes.slice(0, 4).map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="rounded-full border border-foam/20 px-5 py-3 text-foam/80"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("checklist")}
              className="rounded-full bg-mint px-6 py-3 font-medium text-ink-950"
            >
              Start checklist
            </button>
          </div>
        </section>
      )}

      {step === "checklist" && (
        <section className="animate-rise space-y-6">
          <h1 className="font-display text-4xl text-foam">Guided telltales</h1>
          <p className="text-foam/70">
            Mark each researched check. Failures on high-weight telltales pull
            the verdict toward fake.
          </p>
          <div className="space-y-4">
            {telltales.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-foam/10 bg-ink-800/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-display text-xl text-foam">{t.title}</h2>
                  <span className="text-xs text-foam/45">weight {t.weight}/10</span>
                </div>
                <p className="mt-2 text-sm text-foam/65">{t.howToCheck}</p>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-mint">Real: </span>
                    {t.realSign}
                  </p>
                  <p>
                    <span className="text-signal">Fake: </span>
                    {t.fakeSign}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(
                    [
                      ["pass", "Looks real"],
                      ["fail", "Looks fake"],
                      ["unsure", "Unsure"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [t.id]: value }))
                      }
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        answers[t.id] === value
                          ? value === "fail"
                            ? "bg-signal text-ink-950"
                            : value === "pass"
                              ? "bg-mint text-ink-950"
                              : "bg-gold text-ink-950"
                          : "border border-foam/15 text-foam/75 hover:border-foam/35"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("photos")}
              className="rounded-full border border-foam/20 px-5 py-3 text-foam/80"
            >
              Back
            </button>
            <button
              type="button"
              onClick={runScore}
              className="rounded-full bg-mint px-6 py-3 font-medium text-ink-950"
            >
              Score this card
            </button>
          </div>
        </section>
      )}

      {step === "result" && result && (
        <section className="animate-rise space-y-6">
          <h1 className="font-display text-4xl text-foam">Your preview</h1>
          <div className="rounded-3xl border border-foam/10 bg-ink-800/60 p-6 shadow-glow">
            <p className={`font-display text-3xl ${verdictCopy[result.verdict].color}`}>
              {verdictCopy[result.verdict].label}
            </p>
            <p className="mt-2 text-foam/70">{result.summary}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="Authenticity" value={`${result.score}%`} />
              <Stat label="Fake risk" value={`${result.riskScore}%`} />
              <Stat label="Failed tells" value={`${result.failed.length}`} />
            </div>
          </div>

          {!unlocked ? (
            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
              <h2 className="font-display text-2xl text-foam">
                Unlock full report — $1 / card
              </h2>
              <p className="mt-2 text-sm text-foam/70">
                Preview is free. Full report shows every failed/passed telltale,
                weighted reasons, and next-step researcher links. Or grab the $5
                collector pass (10 checks). Demo checkout adds credits instantly
                (no real charge wired yet).
              </p>
              <p className="mt-3 text-sm text-mint">Credits available: {credits}</p>
              {error && <p className="mt-2 text-sm text-signal">{error}</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => buy("single")}
                  className="rounded-full border border-foam/20 px-4 py-2 text-sm text-foam"
                >
                  Add $1 credit
                </button>
                <button
                  type="button"
                  onClick={() => buy("pass")}
                  className="rounded-full border border-foam/20 px-4 py-2 text-sm text-foam"
                >
                  Buy $5 pass (10)
                </button>
                <button
                  type="button"
                  onClick={unlock}
                  className="rounded-full bg-mint px-5 py-2 text-sm font-medium text-ink-950"
                >
                  Unlock with 1 credit
                </button>
                <Link href="/pricing" className="px-2 py-2 text-sm text-foam/60 underline">
                  Pricing details
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DetailBlock
                title="Failed telltales"
                items={result.failed.map(
                  (f) => `${f.telltale.title} (w${f.weight}) — ${f.telltale.fakeSign}`,
                )}
                empty="No hard fails marked."
                tone="signal"
              />
              <DetailBlock
                title="Passed telltales"
                items={result.passed.map(
                  (f) => `${f.telltale.title} (w${f.weight}) — ${f.telltale.realSign}`,
                )}
                empty="No passes marked."
                tone="mint"
              />
              <DetailBlock
                title="Unsure"
                items={result.unsure.map((f) => f.telltale.title)}
                empty="Nothing left unsure."
                tone="gold"
              />
              <div className="rounded-2xl border border-foam/10 bg-ink-800/50 p-4">
                <h3 className="font-display text-xl text-foam">Recommendations</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foam/70">
                  {result.recommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <Link
                  href="/researchers"
                  className="mt-4 inline-block text-sm text-mint underline"
                >
                  Browse authenticity researchers →
                </Link>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setStep("pick");
              setAnswers({});
              setResult(null);
              setUnlocked(false);
              setPhotos({});
            }}
            className="rounded-full border border-foam/20 px-5 py-3 text-foam/80"
          >
            Check another card
          </button>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-foam/45">{label}</p>
      <p className="font-display text-3xl text-foam">{value}</p>
    </div>
  );
}

function DetailBlock({
  title,
  items,
  empty,
  tone,
}: {
  title: string;
  items: string[];
  empty: string;
  tone: "mint" | "signal" | "gold";
}) {
  const color =
    tone === "mint" ? "text-mint" : tone === "signal" ? "text-signal" : "text-gold";
  return (
    <div className="rounded-2xl border border-foam/10 bg-ink-800/50 p-4">
      <h3 className={`font-display text-xl ${color}`}>{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-foam/55">{empty}</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foam/70">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
