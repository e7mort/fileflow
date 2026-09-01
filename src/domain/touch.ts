import type { Deal } from "../types";

export function touchDeal(deal: Deal, at: string): Deal {
  return {
    ...deal,
    lastTouchedAt: at,
    firstTouchedAt: deal.firstTouchedAt ?? at,
  };
}

export function logFirstTouch(deal: Deal, at: string): Deal {
  return {
    ...deal,
    lastTouchedAt: at,
    firstTouchedAt: at,
  };
}

export function isNewLead(deal: Deal): boolean {
  if (deal.firstTouchedAt) {
    return false;
  }
  const completed = deal.tasks.some((task) => task.completed);
  return deal.stage === "lead" || !completed;
}
