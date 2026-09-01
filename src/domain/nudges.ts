import type { Deal } from "../types";
import { isTerminalStage } from "./stages";
import { isNewLead } from "./touch";

export type FileTouchKind = "new" | "stale" | "past" | "fresh";

export const STALE_AFTER_DAYS = 14;
export const PAST_CLIENT_AFTER_DAYS = 180;

export function daysSinceTouch(deal: Deal, today: Date): number {
  const touched = new Date(deal.lastTouchedAt);
  if (Number.isNaN(touched.getTime())) {
    return Number.POSITIVE_INFINITY;
  }
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last = new Date(touched.getFullYear(), touched.getMonth(), touched.getDate());
  return Math.floor((start.getTime() - last.getTime()) / 86_400_000);
}

export function isStaleFile(deal: Deal, today: Date): boolean {
  if (isTerminalStage(deal.stage)) {
    return false;
  }
  return daysSinceTouch(deal, today) >= STALE_AFTER_DAYS;
}

export function isPastClientNudge(deal: Deal, today: Date): boolean {
  return deal.stage === "funded" && daysSinceTouch(deal, today) >= PAST_CLIENT_AFTER_DAYS;
}

export function fileTouchKind(deal: Deal, today: Date): FileTouchKind {
  if (isNewLead(deal)) {
    return "new";
  }
  if (isPastClientNudge(deal, today)) {
    return "past";
  }
  if (isStaleFile(deal, today)) {
    return "stale";
  }
  return "fresh";
}
