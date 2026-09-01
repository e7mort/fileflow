# HoloCheck

Spot fake Pokémon cards with research-backed checklists — **$1 per full report** or **$5 for 10 checks**.

## Why

High-quality counterfeits (like the Masaki Gengar variants documented on [r/GengarMasterSet](https://www.reddit.com/r/GengarMasterSet/s/jPCewF8er0)) fool untrained buyers on muted colors, fonts, energy symbols, and Japanese text. HoloCheck packages those community telltales into a guided product.

## Features

- **Guided check wizard** — pick a card profile, add photos, mark telltales, get a risk score
- **Authenticity database** — universal telltales + card-specific fake profiles with cited sources
- **Researchers directory** — communities, guide authors, graders, and services to escalate
- **Pricing** — free preview; unlock full report for $1 or use a $5 / 10-credit pass (demo wallet)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Local structured research data in `src/data/`
- Client credit wallet via `localStorage` (Stripe-ready UI)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design

See `docs/superpowers/specs/2026-09-01-holocheck-design.md`.

## Disclaimer

HoloCheck is advisory, not a certificate of authenticity and not affiliated with The Pokémon Company. For high-value cards, use PSA / BGS / CGC and community experts.
