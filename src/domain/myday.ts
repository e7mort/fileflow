import type { Deal, Person, Role } from "../types";
import { DEMO_TODAY } from "./maturity";
import { isStaleFile } from "./nudges";
import { primaryBorrower } from "./parties";
import { TEAM, roleLabel } from "./team";

export type TeamDayRow = {
  role: Role;
  person: Person;
  deal: Deal | null;
  note: string;
  readOnly: boolean;
};

function dueKey(deal: Deal): string {
  return deal.nextAction.due ?? "9999-12-31";
}

function waitDue(deal: Deal, personId: string): string {
  if (deal.nextAction.waitingOn?.personId === personId) {
    return deal.nextAction.waitingOn.due ?? "9999-12-31";
  }
  return "9999-12-31";
}

function compareLoudest(personId: string, today: Date) {
  return (left: Deal, right: Deal): number => {
    const waitLeft = left.nextAction.waitingOn?.personId === personId ? 0 : 1;
    const waitRight = right.nextAction.waitingOn?.personId === personId ? 0 : 1;
    if (waitLeft !== waitRight) {
      return waitLeft - waitRight;
    }
    const handoff = waitDue(left, personId).localeCompare(waitDue(right, personId));
    if (handoff !== 0) {
      return handoff;
    }
    const staleLeft = isStaleFile(left, today) ? 0 : 1;
    const staleRight = isStaleFile(right, today) ? 0 : 1;
    if (staleLeft !== staleRight) {
      return staleLeft - staleRight;
    }
    const due = dueKey(left).localeCompare(dueKey(right));
    if (due !== 0) {
      return due;
    }
    return left.id.localeCompare(right.id);
  };
}

export function loudestForPerson(deals: Deal[], personId: string, today: Date = DEMO_TODAY): Deal | null {
  const active = deals.filter((deal) => deal.stage !== "fallen-through");
  const waiting = active.filter((deal) => deal.nextAction.waitingOn?.personId === personId);
  const owned = active.filter((deal) => deal.nextAction.ownerId === personId);
  const pool = [
    ...waiting,
    ...owned.filter((deal) => !waiting.some((item) => item.id === deal.id)),
  ];
  if (pool.length === 0) {
    return null;
  }
  return [...pool].sort(compareLoudest(personId, today))[0] ?? null;
}

function marketingWatch(deals: Deal[]): Deal | null {
  return (
    deals.find((deal) =>
      deal.parties.some((party) => party.role === "realtor" && party.name === "Marlowe Homes"),
    ) ?? deals.find((deal) => deal.parties.some((party) => party.role === "realtor")) ?? null
  );
}

export function teamMyDay(deals: Deal[], today: Date = DEMO_TODAY): TeamDayRow[] {
  return TEAM.map((person) => {
    if (person.role === "marketing") {
      const deal = marketingWatch(deals);
      return {
        role: person.role,
        person,
        deal,
        note: deal
          ? `Read-only watch · ${primaryBorrower(deal).name}. Marketing cannot mutate files.`
          : "Read-only. No partner file to watch.",
        readOnly: true,
      };
    }
    const deal = loudestForPerson(deals, person.id, today);
    const waiting =
      deal?.nextAction.waitingOn?.personId === person.id
        ? deal.nextAction.waitingOn.reason
        : null;
    const action = waiting ?? deal?.nextAction.title ?? `No next action for ${roleLabel(person.role)}.`;
    const note =
      person.role === "uw" && deal
        ? `Shop UW · file-complete / conditions, not lender UW · ${action}`
        : deal
          ? action
          : `No next action for ${roleLabel(person.role)}.`;
    return {
      role: person.role,
      person,
      deal,
      note,
      readOnly: false,
    };
  });
}
