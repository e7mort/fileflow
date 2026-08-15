# Fileflow

Fileflow is a mortgage file CRM for a 2–8 person Canadian brokerage shop. It is a demo, not a live lender system, and it is not advice.

A shop runs one shared pipeline. Every file has exactly one current next action: a title, an owner (or none), a due date, and an optional handoff. Tasks come from stage-gated templates that change with the book. Residential, commercial, and private are three books in the same shop, not three products.

Fileflow is meant to replace a generic kanban, a generic task list, and a spreadsheet that pretends to be a mortgage OS.

The demo skin is dark crystal glass: navy-charcoal wash, frosted panels, thin light edges. Next action stays the loudest thing on a file.

## What you should see

- A persistent banner on every screen: this is a demo, not a live lender system, not advice.
- A pipeline board with mortgage stages: Lead, Application, Submitted, Conditional, Clear to close, Funded, Fallen through.
- Cards that show borrower, amount (CAD), the next action, and whether the file is waiting on someone.
- A people switcher for a four-person fictional shop. There is no login.
  - Morgan Broker (broker)
  - Riley Assistant (processor / assistant)
  - Casey Underwriter (underwriter)
  - Taylor Marketing (viewer)
- **My Work** for the selected person: owned next actions, files waiting on them, and their open checklist items.
- Three books. Filter the board, then open one file from each:
  - Residential: purchase / refinance / renewal / switch, insured or uninsured, stress test as a field (rate or status).
  - Commercial: DSCR and NOI, rent roll / leases, a different condition set.
  - Private: term, exit, broker fee, lawyer / notary, first or second position, a shorter checklist.
- File view: borrowers (more than one is allowed), realtor, lawyer / notary, property, lender, product, amount, close date, maturity date, an editable conditions list (no document vault), the loud next action, the book-specific checklist, in-app @mentions, and a first-class handoff (person + reason + due).
- A 4-month maturity / renewal reminder on the card and the file when the date is in that window. Sidney Sample is inside the window. Alex Example is not.
- A **Calendar** of next-action dues and maturity dates. Click an item to open the file.
- Adding a person who is already on the file is blocked. The UI says they are already assigned.

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

Demo data lives in the browser (`localStorage`). Completing a task or moving a stage survives a refresh. **Reset demo** in the header puts the seed back.

## Tests

```bash
npm test
npm run build
```

A five-minute walkthrough is in [TEST.md](TEST.md).
