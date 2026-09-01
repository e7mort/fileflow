import { describe, expect, it } from "vitest";
import { BOOKS } from "../types";
import { calendarEvents } from "./calendar";
import { isMaturityReminderDue } from "./maturity";
import { isPastClientNudge, isStaleFile } from "./nudges";
import { findAssignedParty, primaryBorrower } from "./parties";
import { TEAM } from "./team";
import { seedDeals } from "./seed";
import { isNewLead } from "./touch";

describe("seedDeals", () => {
  it("seeds 8–12 fictional files across all three books and both terminal stages", () => {
    const deals = seedDeals();
    expect(deals.length).toBeGreaterThanOrEqual(8);
    expect(deals.length).toBeLessThanOrEqual(14);
    for (const book of BOOKS) {
      expect(deals.filter((deal) => deal.book === book).length).toBeGreaterThanOrEqual(2);
    }
    expect(deals.some((deal) => deal.stage === "funded")).toBe(true);
    expect(deals.some((deal) => deal.stage === "review")).toBe(true);
    expect(deals.some((deal) => deal.stage === "fallen-through")).toBe(true);
  });

  it("includes waiting-on handoffs and never invents an owner on Robin Fiction", () => {
    const deals = seedDeals();
    const waiting = deals.filter((deal) => deal.nextAction.waitingOn);
    expect(waiting.length).toBeGreaterThanOrEqual(3);
    const robin = deals.find((deal) => primaryBorrower(deal).name === "Robin Fiction");
    expect(robin?.nextAction.ownerId).toBeNull();
  });

  it("spreads ownership across the shop except Marketing", () => {
    const deals = seedDeals();
    const ownerIds = new Set(
      deals.flatMap((deal) => [
        deal.nextAction.ownerId,
        deal.nextAction.waitingOn?.personId ?? null,
        ...deal.tasks.map((task) => task.ownerId),
      ]),
    );
    for (const person of TEAM) {
      if (person.role === "marketing") {
        continue;
      }
      expect(ownerIds.has(person.id)).toBe(true);
    }
    expect(deals.every((deal) =>
        [...deal.parties, ...TEAM.map((person) => ({ name: person.name }))].every((party) => {
          const first = party.name.split(" ")[0] ?? "";
          return !/^(sam|samuel|quinn|james|eric|e7)$/i.test(first);
        }),
      ),
    ).toBe(true);
    expect(deals.some((deal) => primaryBorrower(deal).name === "Sidney Sample")).toBe(true);
    expect(deals.some((deal) => primaryBorrower(deal).name === "Parker Placeholder")).toBe(true);
  });

  it("seeds a 4-month maturity reminder file and a file outside that window", () => {
    const today = new Date(2026, 7, 14);
    const deals = seedDeals();
    const sidney = deals.find((deal) => primaryBorrower(deal).name === "Sidney Sample");
    const alex = deals.find((deal) => primaryBorrower(deal).name === "Alex Example");
    expect(sidney?.maturityDate).toBe("2026-12-10");
    expect(isMaturityReminderDue(sidney?.maturityDate ?? null, today)).toBe(true);
    expect(isMaturityReminderDue(alex?.maturityDate ?? null, today)).toBe(false);
  });

  it("seeds Sidney Sample with two borrowers, a realtor, and a lawyer", () => {
    const sidney = seedDeals().find((deal) => primaryBorrower(deal).name === "Sidney Sample");
    expect(sidney?.parties.filter((party) => party.role === "borrower")).toHaveLength(2);
    expect(findAssignedParty(sidney!, { name: "Marlowe Homes", email: "" })?.role).toBe("realtor");
    expect(findAssignedParty(sidney!, { name: "Ned Notary", email: "" })?.role).toBe("lawyer");
  });

  it("puts next-action dues and Sidney's maturity on the calendar", () => {
    const events = calendarEvents(seedDeals());
    expect(events.some((event) => event.dealId === "d-alex" && event.kind === "next-action")).toBe(
      true,
    );
    expect(
      events.some(
        (event) =>
          event.kind === "maturity" &&
          event.date === "2026-12-10" &&
          event.borrowerName === "Sidney Sample",
      ),
    ).toBe(true);
  });

  it("seeds new leads, a stale file, and a 6-month past client", () => {
    const deals = seedDeals();
    const today = new Date(2026, 7, 14);
    expect(deals.filter((deal) => isNewLead(deal)).length).toBeGreaterThanOrEqual(2);
    expect(deals.some((deal) => primaryBorrower(deal).name === "Kit Freshfile")).toBe(true);
    expect(
      deals.some(
        (deal) => primaryBorrower(deal).name === "Jordan Demo" && isStaleFile(deal, today),
      ),
    ).toBe(true);
    expect(
      deals.some(
        (deal) =>
          primaryBorrower(deal).name === "Skyler Placeholder" && isPastClientNudge(deal, today),
      ),
    ).toBe(true);
  });
});
