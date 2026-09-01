import type { Deal, Stage } from "../types";
import { personById } from "./team";

export type FileMover = {
  fileNumber: string;
  stage: Stage;
  actionOwner: string;
  docsAction: string;
  lender: string;
  closeDate: string | null;
};

export function docsActionLine(deal: Deal): string {
  const open = deal.conditions.filter((item) => !item.completed);
  if (open.length === 0) {
    return deal.nextAction.title;
  }
  const noun = open.length === 1 ? "open condition" : "open conditions";
  return `${deal.nextAction.title} · ${open.length} ${noun}`;
}

export function fileMover(deal: Deal): FileMover {
  const owner = deal.nextAction.ownerId ? personById(deal.nextAction.ownerId) : undefined;
  return {
    fileNumber: deal.fileNumber,
    stage: deal.stage,
    actionOwner: owner?.name ?? "Unassigned",
    docsAction: docsActionLine(deal),
    lender: deal.lender,
    closeDate: deal.closeDate,
  };
}
