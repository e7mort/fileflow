# Fileflow 5-minute test

You are checking that a stranger can run the demo and see a sellable 3–5 person shop (roles, not names) plus three Canadian books. Steps 13–17 are Today / stale / partners / first-touch / share. Steps 18–20 are Team My Day, Compliance vs Marketing, and Review. Step 21 is invoice / CRM match. Steps 22–23 are the Canada pack: pre-approval with no property docs, and lawyer signing that is not funded. Step 24 is Assistant (unlicensed) gates.

## 1. Start the app

```bash
./start.sh
```

Or `npm install && npm run dev`.

**Expected:** Vite starts and prints a local URL, usually `http://localhost:5173`. The page loads without a login screen. A dark banner at the top says this is a Fileflow demo, not a live lender system, and not advice.

## 2. See the pipeline and the three books

Stay on **Pipeline**. You should see twelve stage columns, in order: **Lead**, **Discovery**, **Pre-approval**, **Application**, **Lender UW**, **Conditional**, **File complete**, **Instructions**, **Lawyer signing**, **Funded**, **Review**, **Fallen through**. Lender UW is the lender’s column (shop UW does not own it). Lawyer signing is not funded. About a dozen fictional files (Alex Example, Jordan Demo, Remy Ratehold, Avery Showcase, Harper Fictional, Blake Exampleton, and others). Several cards show an orange next-action strip. Several show a “Waiting on …” chip (Alex Example waits on Riley, Jordan Demo waits on Casey).

Use the book filter: **All books**, **Residential**, **Commercial**, **Private**.

**Expected:**

- Residential filter keeps purchase / refinance / renewal / switch files (Alex, Jordan, Sidney, Parker, Robin, Kit Freshfile, Skyler, Remy Ratehold, Devon Discovery).
- Commercial filter keeps Avery Showcase, Cameron Testfile, Drew Mockwell.
- Private filter keeps Harper Fictional, Reese Demoaddr, Blake Exampleton.
- Blake Exampleton is in **Fallen through**. Skyler Placeholder is in **Funded**. Drew Mockwell is in **Review**.
- Amounts are in CAD.

## 3. Open one file from each book

Open **Alex Example** (residential). Confirm purpose, insured/uninsured, and a stress test field (status or qualifying rate). Confirm the next action is loud, the checklist is labeled with pack names (**Pre-approval**, **Application**, **Conditional**, and later CA stages), and a note mentions @Riley. There is no Submit to Filogix button.

Open **Avery Showcase** (commercial). Confirm DSCR and NOI fields, rent-roll / NOI / DSCR checklist items, and commercial conditions (rent roll, corporate search).

Open **Harper Fictional** (private). Confirm term, exit strategy, broker fee, lawyer / notary, second position, and a shorter private checklist (term sheet, exit, fee, title / second-position).

**Expected:** Each file shows borrower, property, lender, product, amount, close date, conditions, one next action, and a book-specific checklist. The demo banner is still at the top.

## 4. Perform a team handoff

Stay on Harper Fictional, or go back to Alex Example. In **Current next action**, set:

- Hand off to: **Casey Underwriter**
- Due: a date this month
- Reason: `Need underwriter eyes on the file`
- Click **Set waiting-on**

**Expected:** The file shows “Waiting on Casey Underwriter” plus your reason and due date. Return to the pipeline. That card now shows a waiting-on chip with Casey and the reason. Open **Today**, switch the header to Casey Underwriter, and the file appears under **Waiting on Casey**.

Click **Clear handoff** if you want to undo, or leave it. Refresh the page. The handoff is still there.

## 5. Complete a task and watch the next action change

Open **Alex Example**. Read the current next action title (seeded as **Application · PSA + amendments** unless you already completed it). Click **Complete this action**.

**Expected:** The next action changes to the next unlocked residential application task, usually **Application · MLS listing**. Owner stays whoever that task already had (Morgan), or unassigned. It does not silently become you. The completed item is struck through on the checklist.

## 6. Move the file to another stage

On the same file, use **Move stage** and choose **Conditional**. You can also drag the card on the board into the Conditional column.

**Expected:** The stage badge updates. The checklist unlocks Conditional pack items (signed commitment, disclosures, condition list). The next action prefers work for the new stage, usually **Conditional · Signed commitment**, even if leftover application items are still open. Those leftover items stay on the checklist and stay completable. Later items stay visible with an "unlocks at ..." note. **Lender UW** is a different column, owned by the lender, not shop UW.

## 7. Banner still visible

Click Pipeline, Today, and any file.

**Expected:** The same demo banner is on every screen. Taylor Marketing is read-only: can read files and leave a note, but cannot complete tasks, set a handoff, or move a stage.

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

## 13. Today on a phone-width screen

Narrow the window to about 400px, or open the app on a phone. Click **Today** (or load the app with an empty hash on a narrow viewport). Stay as Morgan Broker.

**Expected:** The page is **Team My Day**. It lists one loudest file per role (LO, Assistant, UW, Compliance, Marketing). You should also see files waiting on Morgan, a **New-lead / first-touch queue** (Robin Fiction and Kit Freshfile), a **Stale / no-touch** section, and a **Past client / no contact** section. Each file row has a **Call** link (`tel:`). The demo banner is still at the top.

## 14. See a stale nudge vs a fresh file

On **Today**, find **Jordan Demo** under **Stale / no-touch (14+ days)**. The note should say it has been more than 14 days since last touch, and the card is labeled **Stale**.

Find **Alex Example** on Today or Pipeline. Alex is **Fresh** (touched 13 Aug 2026).

Under **Past client / no contact (6 months)** you should see **Skyler Placeholder** (funded, last contact January 2026).

**Expected:** Stale, fresh, and 6-month past-client are labeled so you can tell them apart. No email. No SMS.

## 15. Realtor partner pulse after a stage move

Click **Partners**. You should see Marlowe Homes, Brookline Referrals, and Cedar Street Realty.

Open **Brookline Referrals**. Then open **Alex Example**, **Move stage** to **Lender UW**, and return to **Partners → Brookline Referrals**.

**Expected:** A new pulse says **Alex Example moved to Lender UW**. Marlowe Homes already has a seeded pulse that Sidney Sample is in Conditional. Nothing is emailed.

## 16. Clear a first-touch lead

On **Today**, under **New-lead / first-touch queue**, find **Kit Freshfile**. Click **Log first touch**.

**Expected:** Kit leaves the first-touch queue. Robin Fiction stays until you touch that file too. Completing the next action on a new lead also counts as first touch.

## 17. Shareable borrower checklist

Open **Alex Example**. Click **Share checklist**. The page shows a full URL you can copy. Locally that is `http://localhost:5173/#/share/d-alex`. After Pages is on, it is https://e7mort.github.io/fileflow/#/share/d-alex.

**Expected:** A borrower-facing page for Alex Example. Conditions still needed are listed. Click **Mark received** on one item. It shows Received. No upload. No login. The demo banner is still there and still says this is not advice.

## 18. Team My Day by role

Click **Reset demo**, then **Today**. Stay as Morgan Broker.

**Expected:** **By role** shows five seats:

- **LO · Morgan Broker** → Alex Example
- **Assistant · Riley Assistant** → Harper Fictional
- **UW · Casey Underwriter** → Jordan Demo (shop UW / file-complete, not lender UW)
- **Compliance · Finley Compliance** → Parker Placeholder (next action **AML / ID verification**)
- **Marketing · Taylor Marketing** → a read-only watch (Sidney Sample / Marlowe Homes)

Switch the header to Casey Underwriter. The UW row is the one marked as you. **Waiting on Casey** still lists Jordan Demo.

## 19. Compliance vs Marketing permissions

Switch to **Taylor Marketing**. Open **Alex Example**.

**Expected:** No complete-task, handoff, or stage move. A note says Marketing is read-only. You can still leave a note.

Switch to **Finley Compliance**. Open **Parker Placeholder**. Complete **Lawyer signing · AML / ID verification**.

**Expected:** The AML item completes. Other checklist items (HOI binder, Wet Charge) stay disabled for Compliance.

Still as Finley, open Parker **before** completing AML if you reset, and **Move stage** to **Funded**.

**Expected:** The file does not leave Lawyer signing. A note says Compliance / AML verification must be done before this file is funded. After AML is done, LO / Assistant / UW can move Parker to Funded. Lawyer signing is still not itself funded.

## 20. Review-stage file

On **Pipeline**, find **Drew Mockwell** in the **Review** column (after Funded). Open the file.

**Expected:** Stage badge is Review. Checklist includes **Review · Match lender invoice (commission / payout)**, lawyer report, and 7-year / FINTRAC retention. Next action is invoice-match. This is post-close close-out, not a live lender system.

## 21. Invoice match (commission / payout, not borrower income)

Click **Reset demo**. Open **Jordan Demo**.

**Expected:** The file is marked **CONFLICTING**. Operational File # is **FF-002**. MOS file id and FILEKEY are **MOS-77881**. Both ids are on the **Invoice match** panel. Join rules are listed on the file:

- Match invoices to a file by **operational File #** first.
- Else match **MOS file id** or **FILEKEY**.
- Never match on client/borrower name.
- Never trust a parallel spreadsheet deal key alone.
- If operational File # and MOS file id/FILEKEY disagree, mark the file **CONFLICTING** and display both ids.

Funded in Fileflow is **No** (Jordan is File complete). MOS close date and MOS document flags are labeled as **not proof of funded**.

Open **Sidney Sample**. Commission / payout tracking shows FILEKEY **FF-003**, lender Cedar Trust, payout amount, Income Tracking Status **Posted**, and Income Tracking Date **Aug 1, 2026**. Bound invoices include **inv-sidney-hit** via **FILEKEY**, identity match. Funded in Fileflow is still **No** even if a MOS close date or document flag is present.

Click **Invoices** (or **Unmatched invoices** on the file).

**Expected:** **inv-sidney-hit** is bound via FILEKEY to Sidney Sample. **inv-name-miss** is unmatched. The unmatched row still shows the name Sidney Sample and has no FILEKEY. It did not bind on name. There is no document vault. Nothing is emailed.

## 22. Pre-approval with no property docs

Click **Reset demo**. Open **Remy Ratehold** (Pre-approval).

**Expected:** Property is **No property on file**. A note says rate hold is not approval. The unlocked checklist is the Pre-approval pack (ID, 2 pay stubs, employment letter ≤30 days, T4, NOA, debts, 90-day down payment, gift letter). PSA, MLS, and appraisal are locked until Application. There is no document vault.

## 23. Lawyer signing is not funded

Open **Parker Placeholder**.

**Expected:** Stage is **Lawyer signing**, not Funded. Funded in Fileflow is **No**. The file still has HOI binder / loss payee work. Team My Day still shows one next action per LO, Assistant, UW, Compliance, and Marketing.

## 24. Assistant (unlicensed) gates

Click **Reset demo**. Switch the header to **Riley Assistant**. Open **Remy Ratehold**.

**Expected:** You can complete an already-unlocked named chase such as **Pre-approval · 2 pay stubs** or **Pre-approval · Collect ID**. You can leave a note. **Move stage** to **Application** does not work. A note says Assistant cannot accept an application.

Open **Alex Example**. Application · PSA stays disabled for Assistant. There is no submit-to-lender button. Shop UW remains Casey’s seat, not this one.

