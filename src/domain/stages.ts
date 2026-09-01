import { STAGES, type Stage } from "../types";

export const STAGE_LABELS: Record<Stage, string> = {
  lead: "Lead",
  discovery: "Discovery",
  "pre-approval": "Pre-approval",
  application: "Application",
  "lender-uw": "Lender UW",
  conditional: "Conditional",
  "file-complete": "File complete",
  instructions: "Instructions",
  "lawyer-signing": "Lawyer signing",
  funded: "Funded",
  review: "Review",
  "fallen-through": "Fallen through",
  "on-hold": "On Hold",
  inactive: "Inactive",
};

export const STAGE_NOTES: Partial<Record<Stage, string>> = {
  "pre-approval": "No property docs. Rate hold is not approval.",
  "lender-uw": "Lender owns this column, not shop UW.",
  "lawyer-signing": "Not funded. HOI binder with loss payee before funds.",
  review: "Invoice match is commission / payout, not borrower income.",
  "on-hold": "Open file. Not funded. Close date does not move this file.",
  inactive: "Terminal. No open action.",
};

export const STAGE_DEFAULT_NEXT: Record<Stage, string> = {
  lead: "Qualify the lead and book a discovery call",
  discovery: "Run discovery: needs and credit consent",
  "pre-approval": "Collect the pre-approval package. Rate hold is not approval.",
  application: "Collect property docs now that an address exists",
  "lender-uw": "Lender is underwriting. Shop UW does not own this column.",
  conditional: "Work the signed commitment and condition list",
  "file-complete": "Chase remaining file-complete items",
  instructions: "Send mortgage instructions and financing-condition removal",
  "lawyer-signing": "HOI binder, trust funds, and AML. This is not funded.",
  funded: "Confirm funding, closing statement, and registered charge",
  review: "Match the lender invoice and close the file",
  "fallen-through": "File fallen through. No open action.",
  "on-hold": "File is on hold. Next action stays open. This is not funded.",
  inactive: "File is inactive. No open action.",
};

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

export function isTerminalStage(stage: Stage): boolean {
  return stage === "fallen-through" || stage === "inactive";
}

export function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}
