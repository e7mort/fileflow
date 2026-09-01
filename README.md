# Fileflow

Fileflow is a mortgage file CRM for a 2–8 person Canadian brokerage shop. It is a demo, not a live lender system, and it is not advice.

A shop runs one shared pipeline. Every file has exactly one current next action: a title, an owner (or none), a due date, and an optional handoff. Tasks come from stage-gated templates that change with the book. Residential, commercial, and private are three books in the same shop, not three products.

Fileflow is meant to replace a generic kanban, a generic task list, and a spreadsheet that pretends to be a mortgage OS.

The pipeline is a dark jobs board: compact CAD on the KPI strip and column heads, cards with a one-line job plus **Estd** plus a green amount plus a stage chip, **+ New file**, and a short Fileflow sidebar on a wide window (Today / Pipeline / Inbox / Capture / Calendar / Partners). File screens still use frosted panels on a navy-charcoal wash. Next action stays the loudest thing on a file.

Client acquisition sits on top of that shop. A public **Capture** page (`#/capture`) starts a thread. **Inbox** is the SMS / WhatsApp desk: the bot asks purpose, city, amount, and timing, then books a 20-minute consult and hands the file to Riley on reception. Pipeline KPI cards show what the shop actually cares about — open pipeline, funded this month, consults booked, all-time funded — not that a bot exists. Nothing is emailed or texted for real.

## What you should see

- A persistent banner on every screen: this is a demo, not a live lender system, not advice.
- A pipeline board with mortgage stages: Lead, Application, Submitted, Conditional, Clear to close, Funded, Fallen through.
- Four compact KPI cards above the board (open pipeline is about **$8.2M** on a fresh seed). Column heads look like `3 • $1.6M`.
- Cards that show borrower, a one-line job, **Estd** plus amount (CAD), a stage dropdown, the next action, and whether the file is waiting on someone.
- **+ New file** on the pipeline toolbar. It opens Capture.
- On a window wider than 1100px, a left Fileflow sidebar. Header nav links (Today / Pipeline / Inbox / Capture / Calendar / Partners) show only on a narrower window. Person switcher and **Reset demo** stay in the header either way.
- A people switcher for a four-person fictional shop. There is no login.
  - Morgan Broker (broker)
  - Riley Assistant (processor / assistant)
  - Casey Underwriter (underwriter)
  - Taylor Marketing (viewer)
- **Today** for the selected person: owned next actions, files waiting on them, tap-to-call, a new-lead queue, stale files, and a 6-month past-client nudge. On a phone-width window this is the default landing. Pipeline stays on desktop.
- Three books. Filter the board, then open one file from each:
  - Residential: purchase / refinance / renewal / switch, insured or uninsured, stress test as a field (rate or status).
  - Commercial: DSCR and NOI, rent roll / leases, a different condition set.
  - Private: term, exit, broker fee, lawyer / notary, first or second position, a shorter checklist.
- File view: borrowers (more than one is allowed), realtor, lawyer / notary, property, lender, product, amount, close date, maturity date, an editable conditions list (no document vault), the loud next action, the book-specific checklist, in-app @mentions, and a first-class handoff (person + reason + due).
- A 4-month maturity / renewal reminder on the card and the file when the date is in that window. Sidney Sample is inside the window. Alex Example is not.
- A **Calendar** of next-action dues, booked consults, and maturity dates. Click an item to open the file.
- Adding a person who is already on the file is blocked. The UI says they are already assigned.
- **Partners** lists fictional realtors. A stage move writes an in-app pulse on that realtor.
- **Share checklist** (`#/share/d-alex`, full URL on the page) is a borrower-facing conditions list. Mark received. No vault.
- **Capture** (`#/capture`) is a public renewal / purchase funnel. No shop sidebar and no person switcher. Submit opens **Inbox**.
- **Inbox** is the SMS / WhatsApp desk. Seeded threads: Pat Inbound (already booked) and Nico Ads (mid-qualify). Simulate inbound SMS to walk a new lead to a booked consult. The new file lands in Lead with one next action for Riley.

Owner is never invented. If nobody owns the next action, it stays unassigned. Robin Fiction is seeded that way on purpose.

## Start

You need Node 20+.

```bash
./start.sh
```

That installs dependencies and starts the Vite dev server. Or:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). No account. No email. No payments.

A hosted demo at https://e7mort.github.io/fileflow/ needs GitHub Pages turned on once: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Until that click, the URL is not live (`/repos/e7mort/fileflow/pages` is 404). Run it locally.

Alex's shareable checklist, locally:

http://localhost:5173/#/share/d-alex

Demo data lives in the browser (`localStorage`, key `fileflow-demo-v4`). Completing a task or moving a stage survives a refresh. **Reset demo** in the header puts the seed back.

## Tests

```bash
npm test
npm run build
```

CI runs those on pull requests and on pushes to `main` and this feature branch. A five-minute walkthrough is in [TEST.md](TEST.md).
