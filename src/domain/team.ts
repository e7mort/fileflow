import type { Deal, Person, Role, Stage, Task } from "../types";
import { isHoiBinderOpen } from "./closepack";
import { hasFundingConfirm } from "./invoice";
import { earliestUnlockIndex } from "./templates";
import { stageIndex } from "./stages";

export const TEAM: Person[] = [
  { id: "p-morgan", name: "Morgan Broker", role: "lo" },
  { id: "p-riley", name: "Riley Assistant", role: "assistant" },
  { id: "p-casey", name: "Casey Underwriter", role: "uw" },
  { id: "p-finley", name: "Finley Compliance", role: "compliance" },
  { id: "p-taylor", name: "Taylor Marketing", role: "marketing" },
];

export const DEFAULT_PERSON_ID = "p-morgan";

const ASSISTANT_CHASE_TEMPLATE_IDS = new Set([
  "tpl-discovery-needs",
  "tpl-id-docs",
  "tpl-pay-stubs",
  "tpl-employment-letter",
  "tpl-t4",
  "tpl-noa",
  "tpl-debts",
  "tpl-down-payment",
  "tpl-gift-letter",
]);

export function personById(id: string): Person | undefined {
  return TEAM.find((person) => person.id === id);
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "lo":
      return "LO";
    case "assistant":
      return "Assistant";
    case "uw":
      return "UW";
    case "compliance":
      return "Compliance";
    case "marketing":
      return "Marketing";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function canMutateFiles(role: Role): boolean {
  return role !== "marketing";
}

export function canEditDocList(role: Role): boolean {
  return role === "lo" || role === "uw";
}

export function canCompleteTask(role: Role, task: Pick<Task, "kind" | "templateId">): boolean {
  if (role === "marketing") {
    return false;
  }
  if (role === "compliance") {
    return task.kind === "compliance";
  }
  if (role === "assistant") {
    return task.kind === "standard" && ASSISTANT_CHASE_TEMPLATE_IDS.has(task.templateId);
  }
  return true;
}

export function canRecordFundingConfirm(role: Role): boolean {
  return role === "lo" || role === "uw";
}

export function canAdvanceToFunded(deal: Deal, to: Stage): boolean {
  if (to !== "funded" && to !== "review") {
    return true;
  }
  return !deal.tasks.some(
    (task) =>
      task.kind === "compliance" &&
      !task.completed &&
      earliestUnlockIndex(task.unlockStages) <= stageIndex("lawyer-signing"),
  );
}

export function stageAdvanceBlock(deal: Deal, to: Stage, role?: Role): string | null {
  if (role === "assistant" && to === "application") {
    return "Assistant cannot accept an application or move a file into Application.";
  }
  if (to !== "funded" && to !== "review") {
    return null;
  }
  if (!canAdvanceToFunded(deal, to)) {
    return "Compliance / AML verification must be done before this file is funded.";
  }
  if (isHoiBinderOpen(deal)) {
    return "HOI binder (loss payee) is still open. This file cannot be treated as funded.";
  }
  if (!hasFundingConfirm(deal)) {
    return "Funding confirm required. Close date is not proof.";
  }
  return null;
}

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}
