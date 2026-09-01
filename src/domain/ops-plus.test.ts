import { describe, expect, it } from "vitest";
import { alignedFileIdentity, type ResidentialDeal } from "../types";
import { DEMO_TODAY } from "./maturity";
import { daysSinceTouch, fileTouchKind, isPastClientNudge, isStaleFile } from "./nudges";
import { telHref } from "../lib/phone";
import { absoluteHashUrl, parseHash, parseLocation } from "../lib/route";
import { pulseForStageMove, seedPulses } from "./partners";
import { isNewLead, logFirstTouch, touchDeal } from "./touch";

function deal(overrides: Partial<ResidentialDeal> = {}): ResidentialDeal {
  return {
    id: "d-test",
    book: "residential",
    stage: "application",
    parties: [
      {
        id: "p1",
        role: "borrower",
        name: "Alex Example",
        email: "alex.example@example.test",
        phone: "416-555-0101",
      },
      {
        id: "p-re",
        role: "realtor",
        name: "Brookline Referrals",
        email: "brookline.referrals@example.test",
        phone: "416-555-0300",
      },
    ],
    property: { address: "14 Example Lane" },
    lender: "Northpine Bank",
    product: "5-year fixed",
    amount: 500000,
    closeDate: "2026-10-15",
    maturityDate: "2031-10-15",
    conditions: [],
    purpose: "purchase",
    insurance: "uninsured",
    stressTest: { kind: "status", status: "pending" },
    nextAction: {
      taskId: null,
      title: "Collect income docs",
      ownerId: null,
      due: null,
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

describe("stale and past-client nudges", () => {
  it("flags a file with no touch for 14 days", () => {
    const stale = deal({ lastTouchedAt: "2026-07-01T12:00:00.000Z" });
    expect(isStaleFile(stale, DEMO_TODAY)).toBe(true);
    expect(daysSinceTouch(stale, DEMO_TODAY)).toBeGreaterThanOrEqual(14);
  });

  it("does not flag a file touched this week", () => {
    expect(isStaleFile(deal(), DEMO_TODAY)).toBe(false);
  });

  it("flags a funded file with no contact for 6 months", () => {
    const past = deal({
      stage: "funded",
      lastTouchedAt: "2026-01-20T12:00:00.000Z",
    });
    expect(isPastClientNudge(past, DEMO_TODAY)).toBe(true);
    expect(isStaleFile(past, DEMO_TODAY)).toBe(false);
    expect(fileTouchKind(past, DEMO_TODAY)).toBe("past");
  });

  it("labels a recent file fresh and an untouched lead new", () => {
    expect(fileTouchKind(deal(), DEMO_TODAY)).toBe("fresh");
    expect(
      fileTouchKind(
        deal({ stage: "lead", firstTouchedAt: null, lastTouchedAt: "2026-08-14T09:00:00.000Z" }),
        DEMO_TODAY,
      ),
    ).toBe("new");
  });
});

describe("hash routes", () => {
  it("parses today, partners, and share links", () => {
    expect(parseHash("#/today")).toEqual({ name: "today" });
    expect(parseHash("#/work")).toEqual({ name: "today" });
    expect(parseHash("#/partners")).toEqual({ name: "partners" });
    expect(parseHash("#/partners/pt-marlowe")).toEqual({
      name: "partner",
      partnerId: "pt-marlowe",
    });
    expect(parseHash("#/share/d-alex")).toEqual({ name: "share", dealId: "d-alex" });
    expect(parseHash("#/invoices")).toEqual({ name: "invoices" });
  });

  it("opens a share link from the path when the hash is missing", () => {
    expect(
      parseLocation({ hash: "", pathname: "/share/d-alex", origin: "http://localhost:5173" }),
    ).toEqual({ name: "share", dealId: "d-alex" });
  });

  it("builds a full share URL a stranger can paste", () => {
    expect(absoluteHashUrl("#/share/d-alex", { origin: "http://localhost:5173" })).toBe(
      "http://localhost:5173/#/share/d-alex",
    );
    expect(
      absoluteHashUrl("#/share/d-alex", { origin: "https://e7mort.github.io" }, "/fileflow/"),
    ).toBe("https://e7mort.github.io/fileflow/#/share/d-alex");
  });
});

describe("tel links", () => {
  it("builds a tel href from a formatted Canadian number", () => {
    expect(telHref("416-555-0101")).toBe("tel:4165550101");
  });
});

describe("new lead / first touch", () => {
  it("treats an untouched lead as a new-lead item", () => {
    const lead = deal({
      stage: "lead",
      firstTouchedAt: null,
      lastTouchedAt: "2026-08-14T09:00:00.000Z",
    });
    expect(isNewLead(lead)).toBe(true);
    const touched = logFirstTouch(lead, "2026-08-14T12:00:00.000Z");
    expect(isNewLead(touched)).toBe(false);
    expect(touched.firstTouchedAt).toBe("2026-08-14T12:00:00.000Z");
  });

  it("sets first touch when a later action touches the file", () => {
    const lead = deal({ firstTouchedAt: null });
    const touched = touchDeal(lead, "2026-08-14T13:00:00.000Z");
    expect(touched.firstTouchedAt).toBe("2026-08-14T13:00:00.000Z");
  });
});

describe("realtor pulse", () => {
  it("writes an in-app pulse when a file with a realtor changes stage", () => {
    const pulse = pulseForStageMove(deal(), "application", "lender-uw", "2026-08-14T14:00:00.000Z");
    expect(pulse?.partnerId).toBe("pt-brookline");
    expect(pulse?.body).toBe("Alex Example moved to Lender UW");
  });

  it("seeds Marlowe Homes with Sidney already in Conditional", () => {
    expect(seedPulses().some((pulse) => pulse.body.includes("Sidney Sample"))).toBe(true);
  });

  it("writes nothing when the file has no realtor", () => {
    const lone = deal({
      parties: [
        {
          id: "p1",
          role: "borrower",
          name: "Alex Example",
          email: "alex.example@example.test",
          phone: "416-555-0101",
        },
      ],
    });
    expect(pulseForStageMove(lone, "application", "lender-uw", "2026-08-14T14:00:00.000Z")).toBeNull();
  });
});
