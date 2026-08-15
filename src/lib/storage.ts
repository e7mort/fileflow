import type { Deal, PartnerPulse, PersonId } from "../types";
import { DEFAULT_PERSON_ID, TEAM } from "../domain/team";
import { seedPulses } from "../domain/partners";
import { seedDeals } from "../domain/seed";
import { STAGES, BOOKS } from "../types";

export const STORAGE_KEY = "fileflow-demo-v3";

export type PersistedState = {
  deals: Deal[];
  currentPersonId: PersonId;
  pulses: PartnerPulse[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDeal(value: unknown): value is Deal {
  if (!isRecord(value)) {
    return false;
  }
  const book = value.book;
  const stage = value.stage;
  return (
    typeof value.id === "string" &&
    typeof book === "string" &&
    (BOOKS as readonly string[]).includes(book) &&
    typeof stage === "string" &&
    (STAGES as readonly string[]).includes(stage) &&
    Array.isArray(value.parties) &&
    value.parties.length > 0 &&
    Array.isArray(value.conditions) &&
    isRecord(value.nextAction) &&
    typeof value.nextAction.title === "string" &&
    Array.isArray(value.tasks) &&
    typeof value.lastTouchedAt === "string"
  );
}

function isPersisted(value: unknown): value is PersistedState {
  if (!isRecord(value) || !Array.isArray(value.deals) || typeof value.currentPersonId !== "string") {
    return false;
  }
  if (!Array.isArray(value.pulses)) {
    return false;
  }
  if (!TEAM.some((person) => person.id === value.currentPersonId)) {
    return false;
  }
  return value.deals.every(isDeal);
}

export function defaultState(): PersistedState {
  return {
    deals: seedDeals(),
    currentPersonId: DEFAULT_PERSON_ID,
    pulses: seedPulses(),
  };
}

export function loadState(): PersistedState {
  if (typeof localStorage === "undefined") {
    return defaultState();
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isPersisted(parsed)) {
      return parsed;
    }
  } catch {
    return defaultState();
  }
  return defaultState();
}

export function saveState(state: PersistedState): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
