import { describe, expect, it } from "vitest";
import { BOOKS } from "../types";
import { TEAM } from "./team";
import { seedDeals } from "./seed";

describe("seedDeals", () => {
  it("seeds 8–12 fictional files across all three books and both terminal stages", () => {
    const deals = seedDeals();
    expect(deals.length).toBeGreaterThanOrEqual(8);
    expect(deals.length).toBeLessThanOrEqual(12);
    for (const book of BOOKS) {
      expect(deals.filter((deal) => deal.book === book).length).toBeGreaterThanOrEqual(2);
    }
    expect(deals.some((deal) => deal.stage === "funded")).toBe(true);
    expect(deals.some((deal) => deal.stage === "fallen-through")).toBe(true);
  });

  it("includes waiting-on handoffs and never invents an owner on Robin Fiction", () => {
    const deals = seedDeals();
    const waiting = deals.filter((deal) => deal.nextAction.waitingOn);
    expect(waiting.length).toBeGreaterThanOrEqual(3);
    const robin = deals.find((deal) => deal.borrower.name === "Robin Fiction");
    expect(robin?.nextAction.ownerId).toBeNull();
  });

  it("spreads ownership across the four-person shop", () => {
    const deals = seedDeals();
    const ownerIds = new Set(
      deals.flatMap((deal) => [
        deal.nextAction.ownerId,
        deal.nextAction.waitingOn?.personId ?? null,
        ...deal.tasks.map((task) => task.ownerId),
      ]),
    );
    for (const person of TEAM) {
      if (person.role === "viewer") {
        continue;
      }
      expect(ownerIds.has(person.id)).toBe(true);
    }
    expect(deals.every((deal) => !/e7|eric|quinn lee|james/i.test(deal.borrower.name))).toBe(
      true,
    );
  });
});
