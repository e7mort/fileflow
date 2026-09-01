# Fileflow

Fileflow is a mortgage file CRM for a 3–5 person Canadian brokerage shop. It is a demo of a Grok Bot CRM spine similar shops can run, not a live lender system, and it is not advice.

A shop runs one shared pipeline. Every file has exactly one current next action: a title, an owner (or none), a due date, and an optional handoff. Tasks come from stage-gated templates that change with the book. Residential, commercial, and private are three books in the same shop, not three products.

Fileflow is meant to replace a generic kanban, a generic task list, and a spreadsheet that pretends to be a mortgage OS.

The demo skin is dark crystal glass: navy-charcoal wash, frosted panels, thin light edges. Next action stays the loudest thing on a file.

## What you should see

- A persistent banner on every screen: this is a demo, not a live lender system, not advice.
- A pipeline board with mortgage stages: Lead, Application, Submitted, Conditional, Clear to close, Funded, Review, Fallen through.
- Cards that show borrower, amount (CAD), the next action, and whether the file is waiting on someone.
- A people switcher for a five-seat fictional shop. Roles, not names. There is no login.
  - Morgan Broker (LO)
  - Riley Assistant (Processor)
  - Casey Underwriter (UW)
  - Finley Compliance (Compliance)
  - Taylor Marketing (Marketing, read-only)
- **Team My Day** (`Today`): one loudest next action per role, plus waiting-on, tap-to-call, a new-lead queue, stale files, and a 6-month past-client nudge. On a phone-width window this is the default landing. Pipeline stays on desktop.
- Three books. Filter the board, then open one file from each:
  - Residential: purchase / refinance / renewal / switch, insured or uninsured, stress test as a field (rate or status).
  - Commercial: DSCR and NOI, rent roll / leases, a different condition set.
  - Private: term, exit, broker fee, lawyer / notary, first or second position, a shorter checklist.
- File view: borrowers (more than one is allowed), realtor, lawyer / notary, property, lender, product, amount, close date, maturity date, an editable conditions list (no document vault), invoice match (commission / payout tracking, not borrower income), the loud next action, the book-specific checklist, in-app @mentions, and a first-class handoff (person + reason + due).
- Invoice join: operational File # first, else MOS file id or FILEKEY. Never client name. Never a spreadsheet deal key alone. A file whose File # disagrees with MOS id / FILEKEY is **CONFLICTING**. Funded is the Fileflow stage or an explicit funded date — not a MOS close date or document flag. Unmatched invoices live at `#/invoices`.
- A 4-month maturity / renewal reminder on the card and the file when the date is in that window. Sidney Sample is inside the window. Alex Example is not.
- A **Calendar** of next-action dues and maturity dates. Click an item to open the file.
- Adding a person who is already on the file is blocked. The UI says they are already assigned.
- **Today** is Team My Day: one next action per role, waiting-on, tap-to-call, new-lead queue, stale nudges, and a 6-month past-client nudge.
- Stage-gated docs are generic (ID, income, commitment, appraisal, conditions, title, insurance, lawyer, pickup, invoice match, AML).
- Compliance can complete AML checklist items and files cannot leave Clear to close until that verification is done. Marketing cannot mutate files.
- **Partners** lists fictional realtors. A stage move writes an in-app pulse on that realtor.
- **Share checklist** (`#/share/d-alex`, full URL on the page) is a borrower-facing conditions list. Mark received. No vault.

Owner is never invented. If nobody owns the next action, it stays unassigned. Robin Fiction is seeded that way on purpose.

## Start

A clickable hosted demo needs GitHub Pages turned on once for this repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**. After that, the app is:

https://e7mort.github.io/fileflow/

Alex's shareable checklist:

https://e7mort.github.io/fileflow/#/share/d-alex

Until that setting is on, run it locally. You need Node 20+.

```bash
./start.sh
```

That installs dependencies and starts the Vite dev server. Or:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). No account. No email. No payments.

Demo data lives in the browser (`localStorage`). Completing a task or moving a stage survives a refresh. **Reset demo** in the header puts the seed back.

## Tests

```bash
npm test
npm run build
```

A five-minute walkthrough is in [TEST.md](TEST.md).
