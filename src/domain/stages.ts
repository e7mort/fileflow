import { STAGES, type Stage } from "../types";

export const STAGE_LABELS: Record<Stage, string> = {
  lead: "Lead",
  application: "Application",
  submitted: "Submitted",
  conditional: "Conditional",
  "clear-to-close": "Clear to close",
  funded: "Funded",
  review: "Review",
  "fallen-through": "Fallen through",
};

export const STAGE_DEFAULT_NEXT: Record<Stage, string> = {
  lead: "Qualify the lead and request income docs",
  application: "Complete the application package",
  submitted: "Follow up with the lender on the submission",
  conditional: "Work outstanding conditions",
  "clear-to-close": "Confirm lawyer, title, and insurance",
  funded: "Confirm pickup and invoice match",
  review: "Match the lender invoice and close out AML",
  "fallen-through": "File fallen through. No open action.",
};

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

export function isTerminalStage(stage: Stage): boolean {
  return stage === "fallen-through";
}

export function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}
