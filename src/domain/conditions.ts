import type { Condition, ConditionId, Deal } from "../types";

export type AddConditionResult =
  | { ok: true; deal: Deal }
  | { ok: false; error: "empty-title" };

export function addCondition(deal: Deal, title: string): AddConditionResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { ok: false, error: "empty-title" };
  }
  const condition: Condition = {
    id: `cond-${deal.id}-${deal.conditions.length + 1}`,
    title: trimmed,
    completed: false,
    completedAt: null,
  };
  return { ok: true, deal: { ...deal, conditions: [...deal.conditions, condition] } };
}

export function completeCondition(deal: Deal, conditionId: ConditionId): Deal {
  return {
    ...deal,
    conditions: deal.conditions.map((condition) =>
      condition.id === conditionId
        ? { ...condition, completed: true, completedAt: new Date().toISOString() }
        : condition,
    ),
  };
}

export function openConditions(prefix: string, titles: string[]): Condition[] {
  return titles.map((title, index) => ({
    id: `${prefix}-c${index + 1}`,
    title,
    completed: false,
    completedAt: null,
  }));
}
