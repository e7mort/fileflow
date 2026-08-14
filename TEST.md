# Fileflow 5-minute test

You are checking that a stranger can run the demo and see team + three Canadian books without asking anyone questions.

## 1. Start the app

```bash
./start.sh
```

Or `npm install && npm run dev`.

**Expected:** Vite starts and prints a local URL, usually `http://localhost:5173`. The page loads without a login screen. A dark banner at the top says this is a Fileflow demo, not a live lender system, and not advice.

## 2. See the pipeline and the three books

Stay on **Pipeline**. You should see seven stage columns and about a dozen fictional files (Alex Example, Jordan Demo, Avery Showcase, Harper Fictional, Blake Exampleton, and others). Several cards show an orange next-action strip. Several show a “Waiting on …” chip (Alex Example waits on Riley, Jordan Demo waits on Casey).

Use the book filter: **All books**, **Residential**, **Commercial**, **Private**.

**Expected:**

- Residential filter keeps purchase / refinance / renewal / switch files (Alex, Jordan, Sidney, Parker, Robin, Skyler).
- Commercial filter keeps Avery Showcase, Cameron Testfile, Drew Mockwell.
- Private filter keeps Harper Fictional, Reese Demoaddr, Blake Exampleton.
- Blake Exampleton is in **Fallen through**. Skyler Placeholder and Drew Mockwell are in **Funded**.
- Amounts are in CAD.

## 3. Open one file from each book

Open **Alex Example** (residential). Confirm purpose, insured/uninsured, and a stress test field (status or qualifying rate). Confirm the next action is loud, the checklist includes income docs / application package, and a note mentions @Riley.

Open **Avery Showcase** (commercial). Confirm DSCR and NOI fields, rent-roll / NOI / DSCR checklist items, and commercial conditions (rent roll, corporate search).

Open **Harper Fictional** (private). Confirm term, exit strategy, broker fee, lawyer / notary, second position, and a shorter private checklist (term sheet, exit, fee, title / second-position).

**Expected:** Each file shows borrower, property, lender, product, amount, close date, conditions, one next action, and a book-specific checklist. The demo banner is still at the top.

## 4. Perform a team handoff

Stay on Harper Fictional, or go back to Alex Example. In **Current next action**, set:

- Hand off to: **Casey Underwriter**
- Due: a date this month
- Reason: `Need underwriter eyes on the file`
- Click **Set waiting-on**

**Expected:** The file shows “Waiting on Casey Underwriter” plus your reason and due date. Return to the pipeline. That card now shows a waiting-on chip with Casey and the reason. Open **My Work**, switch the header to Casey Underwriter, and the file appears under **Waiting on you**.

Click **Clear handoff** if you want to undo, or leave it. Refresh the page. The handoff is still there.

## 5. Complete a task and watch the next action change

Open **Alex Example**. Read the current next action title (seeded as **Collect income docs** unless you already completed it). Click **Complete this action**.

**Expected:** The next action changes to the next unlocked residential task, usually **Build application package**. Owner stays whoever that task already had (Riley), or unassigned. It does not silently become you. The completed item is struck through on the checklist.

## 6. Move the file to another stage

On the same file, use **Move stage** and choose **Submitted**. You can also drag the card on the board into the Submitted column.

**Expected:** The stage badge updates. The checklist unlocks submitted-stage work (commitment, appraisal). The next action prefers work for the new stage, usually **Receive and review commitment**, even if leftover application items are still open. Those leftover items stay on the checklist and stay completable. Later items stay visible with an "unlocks at ..." note.

## 7. Banner still visible

Click Pipeline, My Work, and any file.

**Expected:** The same demo banner is on every screen. Taylor Marketing (viewer) can read files and leave a note, but cannot complete tasks, set a handoff, or move a stage.

If anything above fails, reset the demo from the header and run the script again from step 2.

## 8. Maturity / renewal reminder (about 4 months out)

On **Pipeline**, find **Sidney Sample** (Conditional, residential renewal). The card should show a green **Renewal** chip with 10 Dec 2026.

Open Sidney Sample. A maturity / renewal reminder banner should sit under the title. The file field **Maturity / renewal** is 10 Dec 2026.

Open **Alex Example**. That file has a maturity of 15 Oct 2031. There is no renewal chip on the card and no reminder banner on the file.

**Expected:** Sidney is inside the 4-month window. Alex is not. This is a reminder only. No email or SMS.

## 9. Multi-party on one file

Stay on **Sidney Sample**. In **People on this file** you should see:

- Sidney Sample (borrower)
- Blair Sampleton (borrower)
- Marlowe Homes (realtor)
- Ned Notary (lawyer / notary)

**Expected:** One file, two borrowers, a named realtor, and a named lawyer. All names are fictional.

## 10. Add and clear a condition (no document vault)

On **Alex Example**, find **Conditions**. Seeded items include **Proof of down payment** and **Employment letter**, each with **Mark done**.

Click **Mark done** on Proof of down payment. Type `Appraisal invoice` in **Add a condition** and click **Add condition**.

**Expected:** Proof of down payment is struck through and says Cleared. Appraisal invoice appears as an open condition. Nothing uploads. There is no document vault.

## 11. Calendar of next actions and maturities

Click **Calendar** in the header. August 2026 is the starting month.

**Expected:** Alex Example appears on 20 Aug 2026 as a next-action item. The **Upcoming** list also shows it. Click the Alex item. The Alex Example file opens.

Use **Next** until **December 2026**. Sidney Sample appears on 10 Dec 2026 as a renewal. Click it. The Sidney Sample file opens.

## 12. Duplicate-person guard

On **Sidney Sample**, under **People on this file**, try to add Marlowe Homes again:

- Name: `Marlowe Homes`
- Role: Realtor (or Borrower)
- Click **Add person**

**Expected:** The person is not added twice. A message says Marlowe Homes is already assigned on this file as realtor. Try the same with `Ned Notary` or `Sidney Sample`. Same block. No silent duplicate.

