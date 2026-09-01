# HoloCheck — Fake Pokémon Card Spotter Design

## Problem

High-quality counterfeit Pokémon cards are flooding marketplaces. Guides like r/GengarMasterSet’s Masaki Gengar write-up show that fakes often fail on micro-details (fonts, kanji, energy symbols, color saturation) that casual buyers miss. Collectors need a cheap, guided tool that packages community research into a $1/check or $5 pass experience.

## Product

**HoloCheck** is a web app that:

1. Stores a researched authenticity database (universal telltales + card-specific fake profiles).
2. Walks users through a photo-assisted checklist scored against that database.
3. Points users to trusted researchers/communities when confidence is low.
4. Charges **$1 per full report** or **$5 for 10 checks** (collector pass).

## Non-goals (MVP)

- Full computer-vision auto-verdict (future).
- Guaranteed authentication / legal certification.
- Physical grading (PSA/BGS/CGC remain the gold standard for high value).

## Architecture

- **Next.js App Router** frontend + lightweight API route for scoring.
- **Structured TypeScript data** under `src/data/` (telltales, card profiles, researchers, sources).
- **Client credit wallet** (localStorage for demo; Stripe-ready pricing UI).
- Scoring is **rule-weighted checklist**, not ML — transparent and explainable.

## Core flows

1. Land → brand hero → “Check a card” CTA.
2. Select known profile (e.g. Masaki Gengar) or General check.
3. Upload front/back/close-up photos (local preview).
4. Answer telltale checklist (pass / fail / unsure).
5. Preview risk score; unlock full report for $1 or use pass credits.
6. Browse database + researcher directory anytime.

## Data model

- `Telltale`: id, category, title, realSign, fakeSign, weight, howToCheck, sources[].
- `CardProfile`: id, name, set, language, riskLevel, specificTelltaleIds, notes, sources[].
- `Researcher`: name, type (community/guide/service), url, focus, notes.
- `Source`: title, url, publisher, usedFor.

## Pricing

| Plan | Price | Credits |
|------|-------|---------|
| Single check | $1 | 1 full report |
| Collector pass | $5 | 10 full reports |

Preview score is free; detailed telltale breakdown + photo tips unlock with credit.

## Trust & safety

- Results are **advisory**, not certification.
- Always cite community researchers; never claim TPCi endorsement.
- Recommend PSA/BGS/CGC for cards > ~$200 when unsure.
- Do not encourage reselling confirmed fakes.

## Research seed sources

- SakuretsuSensei / r/GengarMasterSet counterfeit guide + authenticity megathread
- TCGplayer “How to Spot Fake Pokémon Cards”
- Hardcore Collectors detection guide
- PokéWallet 10 at-home tests
- FROM JAPAN Blog authenticity tips
- TCGrader community authentication
- Athlon Sports 2026 authentication checklist
- Official Pokémon Support counterfeit article
