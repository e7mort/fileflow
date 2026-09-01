import { describe, expect, it } from "vitest";
import { alignedFileIdentity, type FileParty, type ResidentialDeal } from "../types";
import { calendarEvents } from "./calendar";
import { addCondition, completeCondition } from "./conditions";
import { addParty, primaryBorrower } from "./parties";
import { isMaturityReminderDue } from "./maturity";

function party(partial: Partial<FileParty> & Pick<FileParty, "id" | "name" | "role">): FileParty {
  return {
    email: `${partial.id}@example.test`,
    phone: "416-555-0100",
    ...partial,
  };
}

function deal(overrides: Partial<ResidentialDeal> = {}): ResidentialDeal {
  return {
    id: "d-test",
    book: "residential",
    stage: "application",
    parties: [
      party({
        id: "p1",
        role: "borrower",
        name: "Alex Example",
        email: "alex.example@example.test",
      }),
    ],
    property: { address: "14 Example Lane, Demo City ON" },
    lender: "Northpine Bank",
    product: "5-year fixed",
    amount: 500000,
    closeDate: "2026-10-15",
    maturityDate: "2031-10-15",
    conditions: [
      {
        id: "c1",
        title: "Proof of down payment",
        completed: false,
        completedAt: null,
      },
    ],
    purpose: "purchase",
    insurance: "uninsured",
    stressTest: { kind: "status", status: "pending" },
    nextAction: {
      taskId: null,
      title: "Collect income docs",
      ownerId: null,
      due: "2026-08-20",
      waitingOn: null,
    },
    tasks: [],
    mentions: [],
    lastTouchedAt: "2026-08-13T12:00:00.000Z",
    firstTouchedAt: "2026-08-01T12:00:00.000Z",
    ...alignedFileIdentity("FF-T"),
    ...overrides,
  };
}

describe("isMaturityReminderDue", () => {
  const today = new Date(2026, 7, 14);

  it("flags a maturity about four months out", () => {
    expect(isMaturityReminderDue("2026-12-10", today)).toBe(true);
  });

  it("does not flag a maturity years away", () => {
    expect(isMaturityReminderDue("2031-10-15", today)).toBe(false);
  });

  it("does not flag a missing or already-past maturity", () => {
    expect(isMaturityReminderDue(null, today)).toBe(false);
    expect(isMaturityReminderDue("2026-07-01", today)).toBe(false);
  });
});

describe("addParty", () => {
  it("adds a realtor who is not already on the file", () => {
    const result = addParty(deal(), {
      name: "Marlowe Homes",
      email: "marlowe.homes@example.test",
      phone: "905-555-0200",
      role: "realtor",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.deal.parties).toHaveLength(2);
      expect(result.deal.parties[1]?.role).toBe("realtor");
    }
  });

  it("blocks a person already on the file by name", () => {
    const result = addParty(deal(), {
      name: "Alex Example",
      email: "other@example.test",
      phone: "416-555-0199",
      role: "borrower",
    });
    expect(result.ok).toBe(false);
    if (!result.ok && result.error === "already-assigned") {
      expect(result.existing.role).toBe("borrower");
    }
  });

  it("blocks a person already on the file by email", () => {
    const result = addParty(deal(), {
      name: "Alex Other",
      email: "alex.example@example.test",
      phone: "416-555-0199",
      role: "lawyer",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("already-assigned");
    }
  });
});

describe("conditions", () => {
  it("adds a condition without any document upload", () => {
    const result = addCondition(deal(), "Appraisal invoice");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.deal.conditions.map((item) => item.title)).toContain("Appraisal invoice");
      expect(result.deal.conditions.at(-1)?.completed).toBe(false);
    }
  });

  it("marks a condition complete", () => {
    const updated = completeCondition(deal(), "c1");
    expect(updated.conditions[0]?.completed).toBe(true);
    expect(updated.conditions[0]?.completedAt).toBeTruthy();
  });
});

describe("calendarEvents", () => {
  it("includes next-action dues and maturity dates and keeps the borrower name", () => {
    const events = calendarEvents([
      deal(),
      deal({
        id: "d-sidney",
        parties: [
          party({ id: "p-sid", role: "borrower", name: "Sidney Sample" }),
        ],
        nextAction: {
          taskId: null,
          title: "Clear outstanding conditions",
          ownerId: null,
          due: null,
          waitingOn: null,
        },
        maturityDate: "2026-12-10",
      }),
    ]);
    expect(events.some((event) => event.kind === "next-action" && event.date === "2026-08-20")).toBe(
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
});

describe("primaryBorrower", () => {
  it("returns the first borrower on a multi-party file", () => {
    const file = deal({
      parties: [
        party({ id: "p1", role: "borrower", name: "Sidney Sample" }),
        party({ id: "p2", role: "borrower", name: "Blair Sampleton" }),
        party({ id: "p3", role: "realtor", name: "Marlowe Homes" }),
      ],
    });
    expect(primaryBorrower(file).name).toBe("Sidney Sample");
  });
});
