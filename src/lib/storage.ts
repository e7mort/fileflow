import type { Consult, Conversation, Deal, PartnerPulse, PersonId } from "../types";
import { DEFAULT_PERSON_ID, TEAM } from "../domain/team";
import { seedPulses } from "../domain/partners";
import { seedConsults, seedConversations } from "../domain/acquire";
import { seedDeals } from "../domain/seed";
import { STAGES, BOOKS } from "../types";

export const STORAGE_KEY = "fileflow-demo-v4";

export type PersistedState = {
  deals: Deal[];
  currentPersonId: PersonId;
  pulses: PartnerPulse[];
  conversations: Conversation[];
  consults: Consult[];
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

function isConversation(value: unknown): value is Conversation {
  return isRecord(value) && typeof value.id === "string" && Array.isArray(value.messages);
}

function isConsult(value: unknown): value is Consult {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.dealId === "string" &&
    typeof value.slotId === "string"
  );
}

function isPersisted(value: unknown): value is PersistedState {
  if (!isRecord(value) || !Array.isArray(value.deals) || typeof value.currentPersonId !== "string") {
    return false;
  }
  if (!Array.isArray(value.pulses) || !Array.isArray(value.conversations) || !Array.isArray(value.consults)) {
    return false;
  }
  if (!TEAM.some((person) => person.id === value.currentPersonId)) {
    return false;
  }
  return (
    value.deals.every(isDeal) &&
    value.conversations.every(isConversation) &&
    value.consults.every(isConsult)
  );
}

export function defaultState(): PersistedState {
  return {
    deals: seedDeals(),
    currentPersonId: DEFAULT_PERSON_ID,
    pulses: seedPulses(),
    conversations: seedConversations(),
    consults: seedConsults(),
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
