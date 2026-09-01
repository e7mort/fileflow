import { STAGES, type Book, type Stage, type TaskKind, type TaskTemplate } from "../types";

const ALL: Book[] = ["residential", "commercial", "private"];
const RESI: Book[] = ["residential"];
const RESI_COMM: Book[] = ["residential", "commercial"];
const COMM: Book[] = ["commercial"];
const PRIV: Book[] = ["private"];

function tpl(
  id: string,
  title: string,
  packLabel: string,
  unlockStages: Stage[],
  order: number,
  books: Book[] = ALL,
  kind: TaskKind = "standard",
): TaskTemplate {
  return { id, title, packLabel, unlockStages, order, books, kind };
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  tpl("tpl-discovery-needs", "Discovery · Needs and credit consent", "Discovery", ["discovery"], 5),

  tpl("tpl-id-docs", "Pre-approval · Collect ID", "Pre-approval", ["pre-approval"], 10),
  tpl("tpl-pay-stubs", "Pre-approval · 2 pay stubs", "Pre-approval", ["pre-approval"], 11, RESI),
  tpl("tpl-employment-letter", "Pre-approval · Letter of employment (≤30 days)", "Pre-approval", ["pre-approval"], 12, RESI),
  tpl("tpl-t4", "Pre-approval · T4", "Pre-approval", ["pre-approval"], 13, RESI),
  tpl("tpl-noa", "Pre-approval · NOA", "Pre-approval", ["pre-approval"], 14, RESI),
  tpl("tpl-debts", "Pre-approval · Debts list", "Pre-approval", ["pre-approval"], 15, RESI),
  tpl("tpl-down-payment", "Pre-approval · 90-day down payment", "Pre-approval", ["pre-approval"], 16, RESI),
  tpl("tpl-gift-letter", "Pre-approval · Gift letter", "Pre-approval", ["pre-approval"], 17, RESI),

  tpl("tpl-rent-roll", "Collect rent roll and leases", "Application", ["application"], 20, COMM),
  tpl("tpl-noi", "Complete NOI worksheet", "Application", ["application"], 21, COMM),
  tpl("tpl-dscr", "Record DSCR", "Application", ["application"], 22, COMM),
  tpl("tpl-term-sheet", "Issue term sheet", "Application", ["lead", "application"], 20, PRIV),
  tpl("tpl-exit", "Document exit strategy", "Application", ["application"], 21, PRIV),
  tpl("tpl-broker-fee", "Broker fee agreement", "Application", ["application"], 22, PRIV),
  tpl("tpl-private-lawyer", "Instruct lawyer / solicitor", "Application", ["application", "conditional"], 23, PRIV),
  tpl("tpl-second-position", "Title / second-position search", "Application", ["application", "conditional"], 24, PRIV),

  tpl("tpl-psa", "Application · PSA + amendments", "Application", ["application"], 30, RESI),
  tpl("tpl-mls", "Application · MLS listing", "Application", ["application"], 31, RESI),
  tpl("tpl-deposit", "Application · Deposit confirmation", "Application", ["application"], 32, RESI),
  tpl("tpl-realtor-lawyer-names", "Application · Realtor + lawyer names", "Application", ["application"], 33),
  tpl("tpl-appraisal", "Application · Appraisal", "Application", ["application", "file-complete"], 34, RESI_COMM),
  tpl("tpl-condo", "Application · Condo status (if any)", "Application", ["application"], 35, RESI),
  tpl("tpl-void-cheque", "Application · Void cheque", "Application", ["application"], 36),
  tpl("tpl-names-match", "Application · Names match", "Application", ["application"], 37),
  tpl("tpl-official-pdfs", "Application · Official PDFs", "Application", ["application"], 38),
  tpl("tpl-stress-test", "Application · Record stress test / qualifying rate", "Application", ["application"], 39, RESI),

  tpl("tpl-commitment", "Conditional · Signed commitment", "Conditional", ["conditional"], 50),
  tpl("tpl-disclosures", "Conditional · Disclosures", "Conditional", ["conditional"], 51),
  tpl("tpl-outstanding", "Conditional · Condition list", "Conditional", ["conditional"], 52),
  tpl("tpl-environmental", "Environmental / Phase I", "Conditional", ["conditional"], 55, COMM),

  tpl("tpl-fresh-stubs", "File complete · Fresh stubs / employment letter", "File complete", ["file-complete"], 60, RESI),
  tpl("tpl-title", "File complete · Title search", "File complete", ["file-complete"], 61, RESI),
  tpl("tpl-hoi-progress", "File complete · HOI in progress", "File complete", ["file-complete"], 62),

  tpl("tpl-registration-instructions", "Instructions · Mortgage registration instructions to lawyer", "Instructions", ["instructions"], 70),
  tpl("tpl-nof", "Instructions · Financing-condition removal / NOF", "Instructions", ["instructions"], 71, RESI),

  tpl("tpl-aml-check", "Lawyer signing · AML / ID verification", "Lawyer signing", ["lawyer-signing"], 80, ALL, "compliance"),
  tpl("tpl-hoi-binder", "Lawyer signing · HOI binder with loss payee (before funds)", "Lawyer signing", ["lawyer-signing"], 81),
  tpl("tpl-wet-charge", "Lawyer signing · Wet Charge", "Lawyer signing", ["lawyer-signing"], 82),
  tpl("tpl-trust-funds", "Lawyer signing · Down payment + costs in trust", "Lawyer signing", ["lawyer-signing"], 83),

  tpl("tpl-funding-confirm", "Funded · Funding confirm", "Funded", ["funded"], 90),
  tpl("tpl-closing-statement", "Funded · Closing statement", "Funded", ["funded"], 91),
  tpl("tpl-registered-charge", "Funded · Registered charge", "Funded", ["funded"], 92),

  tpl("tpl-invoice-match", "Review · Match lender invoice (commission / payout)", "Review", ["review"], 100),
  tpl("tpl-lawyer-report", "Review · Lawyer report", "Review", ["review"], 101),
  tpl("tpl-file-retention", "Review · Completeness + 7-year file / 5-year FINTRAC", "Review", ["review"], 102),
  tpl("tpl-aml-closeout", "Review · AML / compliance close-out", "Review", ["review"], 103, ALL, "compliance"),
];

export function templatesForBook(book: Book): TaskTemplate[] {
  return TASK_TEMPLATES.filter((template) => template.books.includes(book)).sort(
    (a, b) => a.order - b.order,
  );
}

export function earliestUnlockIndex(unlockStages: Stage[]): number {
  return Math.min(...unlockStages.map((stage) => STAGES.indexOf(stage)));
}
