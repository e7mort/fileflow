import type { Deal } from "../types";
import { hasFundingConfirm } from "./invoice";

export const CLOSE_PACK_IDS = [
  "signed-commitment",
  "compliance-sent",
  "hoi-binder",
  "lawyer-named",
  "title",
  "funding-confirm",
] as const;

export const SOP_COLUMN_IDS = ["hoi-binder", "lawyer-named", "instructions-sent"] as const;

export type PackStatus = "on-file" | "open";

export type PackRow = {
  id: string;
  label: string;
  status: PackStatus;
  detail: string;
};

function taskCompleted(deal: Deal, templateId: string): boolean {
  return deal.tasks.some((task) => task.templateId === templateId && task.completed);
}

function lawyerNamed(deal: Deal): boolean {
  return deal.parties.some((party) => party.role === "lawyer");
}

function titleOnFile(deal: Deal): boolean {
  return (
    taskCompleted(deal, "tpl-title") || taskCompleted(deal, "tpl-second-position")
  );
}

function row(id: string, label: string, onFile: boolean): PackRow {
  return {
    id,
    label,
    status: onFile ? "on-file" : "open",
    detail: onFile ? "On file" : "Open",
  };
}

export function isHoiBinderOpen(deal: Deal): boolean {
  return !taskCompleted(deal, "tpl-hoi-binder");
}

export function closePackRows(deal: Deal): PackRow[] {
  return [
    row("signed-commitment", "Signed commitment", taskCompleted(deal, "tpl-commitment")),
    row("compliance-sent", "Compliance sent", taskCompleted(deal, "tpl-aml-check")),
    row("hoi-binder", "HOI binder (loss payee)", taskCompleted(deal, "tpl-hoi-binder")),
    row("lawyer-named", "Lawyer / notary named", lawyerNamed(deal)),
    row("title", "Title", titleOnFile(deal)),
    row("funding-confirm", "Funding confirm", hasFundingConfirm(deal)),
  ];
}

export function sopColumnRows(deal: Deal): PackRow[] {
  return [
    row("hoi-binder", "HOI binder (loss payee)", taskCompleted(deal, "tpl-hoi-binder")),
    row("lawyer-named", "Lawyer / notary named", lawyerNamed(deal)),
    row(
      "instructions-sent",
      "Instructions sent",
      taskCompleted(deal, "tpl-registration-instructions"),
    ),
  ];
}
