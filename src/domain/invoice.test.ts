import { describe, expect, it } from "vitest";
import type { Invoice, ResidentialDeal } from "../types";
import {
  JOIN_RULES,
  bindInvoice,
  identityMatches,
  isConflicting,
  isFundedInFileflow,
  unmatchedInvoices,
} from "./invoice";
import { primaryBorrower } from "./parties";
import { seedDeals, seedInvoices } from "./seed";

function file(overrides: Partial<ResidentialDeal> = {}): ResidentialDeal {
  return {
    id: "d-test",
    book: "residential",
    stage: "application",
    parties: [
      {
        id: "p1",
        role: "borrower",
        name: "Sidney Sample",
        email: "sidney.sample@example.test",
        phone: "905-555-0188",
      },
    ],
    property: { address: "3 Fiction Court" },
    lender: "Cedar Trust",
    product: "3-year fixed",
    amount: 385000,
    closeDate: "2026-09-10",
    maturityDate: "2026-12-10",
    conditions: [],
    purpose: "renewal",
    insurance: "uninsured",
    stressTest: { kind: "status", status: "passed" },
    nextAction: {
      taskId: null,
      title: "Work outstanding conditions",
      ownerId: null,
      due: null,
      waitingOn: null,
    },
    tasks: [],
    mentions: [],
    lastTouchedAt: "2026-08-12T12:00:00.000Z",
    firstTouchedAt: "2026-07-20T12:00:00.000Z",
    fileNumber: "FF-003",
    mosFileId: "FF-003",
    fileKey: "FF-003",
    spreadsheetDealKey: "SS-SIDNEY",
    fundedAt: null,
    fundingConfirmRef: null,
    mosCloseDate: "2026-08-01",
    mosDocumentFlags: "funded-docs",
    payoutAmount: 4620,
    payoutTrackingStatus: "Posted",
    payoutTrackingDate: "2026-08-01",
    ...overrides,
  };
}

function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-test",
    operationalFileNumber: null,
    mosFileId: null,
    fileKey: "FF-003",
    spreadsheetDealKey: "SS-SIDNEY",
    borrowerName: "Sidney Sample",
    lender: "Cedar Trust",
    payoutAmount: 4620,
    incomeTrackingStatus: "Posted",
    incomeTrackingDate: "2026-08-01",
    ...overrides,
  };
}

describe("join rules", () => {
  it("lists operational File # first, then MOS id / FILEKEY, and never name or spreadsheet key", () => {
    expect(JOIN_RULES[0]).toMatch(/operational File #/i);
    expect(JOIN_RULES.some((rule) => /MOS file id|FILEKEY/i.test(rule))).toBe(true);
    expect(JOIN_RULES.some((rule) => /never match on client\/borrower name/i.test(rule))).toBe(true);
    expect(JOIN_RULES.some((rule) => /never trust a parallel spreadsheet deal key alone/i.test(rule))).toBe(
      true,
    );
    expect(JOIN_RULES.some((rule) => /CONFLICTING/i.test(rule))).toBe(true);
  });

  it("matches operational File # before FILEKEY", () => {
    const other = file({
      id: "d-other",
      fileNumber: "FF-001",
      mosFileId: "FF-001",
      fileKey: "FF-001",
      lender: "Northpine Bank",
      payoutAmount: 100,
    });
    const sidney = file();
    const bound = bindInvoice(
      invoice({ operationalFileNumber: "FF-001", fileKey: "FF-003" }),
      [sidney, other],
    );
    expect(bound.status).toBe("bound");
    if (bound.status === "bound") {
      expect(bound.dealId).toBe("d-other");
      expect(bound.via).toBe("operational-file-number");
    }
  });

  it("matches FILEKEY when operational File # is absent", () => {
    const bound = bindInvoice(invoice({ operationalFileNumber: null, fileKey: "FF-003" }), [file()]);
    expect(bound).toMatchObject({ status: "bound", dealId: "d-test", via: "filekey" });
  });

  it("matches MOS file id when operational File # is absent", () => {
    const jordan = file({
      id: "d-jordan",
      fileNumber: "FF-002",
      mosFileId: "MOS-77881",
      fileKey: "MOS-77881",
    });
    const bound = bindInvoice(
      invoice({
        operationalFileNumber: null,
        mosFileId: "MOS-77881",
        fileKey: null,
      }),
      [file(), jordan],
    );
    expect(bound).toMatchObject({ status: "bound", dealId: "d-jordan", via: "mos-file-id" });
  });

  it("does not fall through to FILEKEY when operational File # is present and misses", () => {
    const bound = bindInvoice(
      invoice({ operationalFileNumber: "FF-999", fileKey: "FF-003" }),
      [file()],
    );
    expect(bound.status).toBe("unmatched");
  });

  it("does not bind on borrower name or spreadsheet deal key alone", () => {
    const byName = bindInvoice(
      invoice({
        operationalFileNumber: null,
        mosFileId: null,
        fileKey: null,
        borrowerName: "Sidney Sample",
        spreadsheetDealKey: null,
      }),
      [file()],
    );
    expect(byName.status).toBe("unmatched");
    if (byName.status === "unmatched") {
      expect(byName.ignored).toBe("borrower-name");
    }
    const bySheet = bindInvoice(
      invoice({
        operationalFileNumber: null,
        mosFileId: null,
        fileKey: null,
        borrowerName: null,
        spreadsheetDealKey: "SS-SIDNEY",
      }),
      [file()],
    );
    expect(bySheet.status).toBe("unmatched");
    if (bySheet.status === "unmatched") {
      expect(bySheet.ignored).toBe("spreadsheet-deal-key");
    }
  });
});

describe("conflicting ids and funded proof", () => {
  it("marks a file CONFLICTING when operational File # disagrees with MOS id / FILEKEY", () => {
    expect(isConflicting(file())).toBe(false);
    expect(
      isConflicting(file({ fileNumber: "FF-002", mosFileId: "MOS-77881", fileKey: "MOS-77881" })),
    ).toBe(true);
  });

  it("treats only an explicit funding confirm as funded, not stage, close date, or MOS close", () => {
    expect(isFundedInFileflow(file({ stage: "application", fundedAt: null, fundingConfirmRef: null }))).toBe(
      false,
    );
    expect(isFundedInFileflow(file({ stage: "funded", fundedAt: null, fundingConfirmRef: null }))).toBe(false);
    expect(isFundedInFileflow(file({ stage: "review", fundedAt: null, fundingConfirmRef: null }))).toBe(false);
    expect(
      isFundedInFileflow(
        file({
          stage: "lawyer-signing",
          closeDate: "2026-08-27",
          fundedAt: null,
          fundingConfirmRef: null,
        }),
      ),
    ).toBe(false);
    expect(
      isFundedInFileflow(
        file({
          stage: "lawyer-signing",
          fundedAt: null,
          fundingConfirmRef: null,
          closeDate: "2026-08-27",
          mosCloseDate: "2026-07-28",
          mosDocumentFlags: "funded-docs",
        }),
      ),
    ).toBe(false);
    expect(isFundedInFileflow(file({ stage: "lawyer-signing", fundedAt: "2026-08-01" }))).toBe(true);
    expect(
      isFundedInFileflow(file({ stage: "application", fundedAt: null, fundingConfirmRef: "FC-TEST-1" })),
    ).toBe(true);
  });

  it("requires FILEKEY + lender + payout amount + tracking status/date for identity", () => {
    const deal = file();
    expect(identityMatches(invoice(), deal)).toBe(true);
    expect(identityMatches(invoice({ payoutAmount: 9999 }), deal)).toBe(false);
    expect(identityMatches(invoice({ fileKey: null }), deal)).toBe(false);
  });
});

describe("seed invoices", () => {
  it("seeds aligned ids, one CONFLICTING file, a Sidney FILEKEY hit, and a name miss", () => {
    const deals = seedDeals();
    const invoices = seedInvoices();
    expect(deals.filter((deal) => isConflicting(deal)).length).toBeGreaterThanOrEqual(1);
    expect(deals.filter((deal) => !isConflicting(deal)).length).toBeGreaterThan(
      deals.filter((deal) => isConflicting(deal)).length,
    );
    const sidney = deals.find((deal) => primaryBorrower(deal).name === "Sidney Sample");
    expect(sidney).toBeTruthy();
    const hit = invoices.find((row) => row.id === "inv-sidney-hit");
    expect(hit).toBeTruthy();
    const bound = bindInvoice(hit!, deals);
    expect(bound.status).toBe("bound");
    if (bound.status === "bound") {
      expect(bound.dealId).toBe(sidney?.id);
      expect(bound.via).toBe("filekey");
      expect(bound.identityMatch).toBe(true);
    }
    const miss = invoices.find((row) => row.id === "inv-name-miss");
    expect(miss?.borrowerName).toBe("Sidney Sample");
    expect(miss?.fileKey).toBeNull();
    const missed = bindInvoice(miss!, deals);
    expect(missed.status).toBe("unmatched");
    expect(unmatchedInvoices(invoices, deals).some((row) => row.id === "inv-name-miss")).toBe(true);
  });
});
