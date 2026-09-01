import { describe, expect, it } from "vitest";
import { alignedFileIdentity, type ResidentialDeal, type Task } from "../types";
import { CLOSE_PACK_IDS, SOP_COLUMN_IDS, closePackRows, sopColumnRows } from "./closepack";
import { isFundedInFileflow } from "./invoice";
import { docsActionLine, fileMover } from "./mover";
import { primaryBorrower } from "./parties";
import { seedDeals } from "./seed";
import { canRecordFundingConfirm } from "./team";

function task(partial: Partial<Task> & Pick<Task, "id" | "title">): Task {
  return {
    templateId: partial.templateId ?? partial.id,
    unlockStages: partial.unlockStages ?? ["application"],
    ownerId: partial.ownerId ?? null,
    due: partial.due ?? null,
    completed: partial.completed ?? false,
    completedAt: partial.completedAt ?? null,
    kind: partial.kind ?? "standard",
    packLabel: partial.packLabel ?? "",
    ...partial,
  };
}

function resiDeal(overrides: Partial<ResidentialDeal> = {}): ResidentialDeal {
  return {
    id: "d-test",
    book: "residential",
    stage: "lawyer-signing",
    parties: [
      {
        id: "p-alex",
        role: "borrower",
        name: "Alex Example",
        email: "alex.example@example.test",
        phone: "416-555-0100",
      },
    ],
    property: { address: "14 Example Lane, Demo City ON" },
    lender: "Northpine Bank",
    product: "5-year fixed",
    amount: 500000,
    closeDate: "2026-10-15",
    maturityDate: "2031-10-15",
    conditions: [
      {
        id: "c-hoi",
        title: "Insurance binder to lawyer",
        completed: false,
        completedAt: null,
      },
    ],
    purpose: "purchase",
    insurance: "uninsured",
    stressTest: { kind: "status", status: "pending" },
    nextAction: {
      taskId: "t-aml",
      title: "Lawyer signing · AML / ID verification",
      ownerId: "p-finley",
      due: null,
      waitingOn: null,
    },
    tasks: [
      task({
        id: "t-commit",
        templateId: "tpl-commitment",
        title: "Conditional · Signed commitment",
        completed: true,
      }),
      task({
        id: "t-aml",
        templateId: "tpl-aml-check",
        title: "Lawyer signing · AML / ID verification",
        unlockStages: ["lawyer-signing"],
        kind: "compliance",
      }),
      task({
        id: "t-hoi",
        templateId: "tpl-hoi-binder",
        title: "Lawyer signing · HOI binder with loss payee (before funds)",
        unlockStages: ["lawyer-signing"],
      }),
      task({
        id: "t-title",
        templateId: "tpl-title",
        title: "File complete · Title search",
      }),
      task({
        id: "t-instr",
        templateId: "tpl-registration-instructions",
        title: "Instructions · Mortgage registration instructions to lawyer",
        completed: true,
      }),
    ],
    mentions: [],
    lastTouchedAt: "2026-08-13T12:00:00.000Z",
    firstTouchedAt: "2026-08-01T12:00:00.000Z",
    ...alignedFileIdentity("FF-T"),
    ...overrides,
  };
}

describe("close pack", () => {
  it("always shows the six required close-pack rows, including empty ones", () => {
    expect([...CLOSE_PACK_IDS]).toEqual([
      "signed-commitment",
      "compliance-sent",
      "hoi-binder",
      "lawyer-named",
      "title",
      "funding-confirm",
    ]);
    const rows = closePackRows(resiDeal());
    expect(rows.map((row) => row.id)).toEqual([...CLOSE_PACK_IDS]);
    expect(rows.every((row) => row.status === "on-file" || row.status === "open")).toBe(true);
    const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
    expect(byId["signed-commitment"]?.status).toBe("on-file");
    expect(byId["compliance-sent"]?.status).toBe("open");
    expect(byId["hoi-binder"]?.status).toBe("open");
    expect(byId["lawyer-named"]?.status).toBe("open");
    expect(byId.title?.status).toBe("open");
    expect(byId["funding-confirm"]?.status).toBe("open");
  });

  it("marks lawyer named and funding confirm on file when those facts exist", () => {
    const rows = closePackRows(
      resiDeal({
        fundedAt: "2026-08-14",
        fundingConfirmRef: "FC-TEST",
        parties: [
          {
            id: "p-alex",
            role: "borrower",
            name: "Alex Example",
            email: "alex.example@example.test",
            phone: "416-555-0100",
          },
          {
            id: "p-law",
            role: "lawyer",
            name: "Lee Counsel",
            email: "lee.counsel@example.test",
            phone: "416-555-0199",
          },
        ],
      }),
    );
    const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
    expect(byId["lawyer-named"]?.status).toBe("on-file");
    expect(byId["funding-confirm"]?.status).toBe("on-file");
  });

  it("always shows SOP columns for HOI binder, lawyer named, and instructions sent", () => {
    expect([...SOP_COLUMN_IDS]).toEqual(["hoi-binder", "lawyer-named", "instructions-sent"]);
    const rows = sopColumnRows(resiDeal());
    expect(rows.map((row) => row.id)).toEqual([...SOP_COLUMN_IDS]);
    const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
    expect(byId["hoi-binder"]?.status).toBe("open");
    expect(byId["lawyer-named"]?.status).toBe("open");
    expect(byId["instructions-sent"]?.status).toBe("on-file");
  });
});

describe("what moves a file", () => {
  it("surfaces File #, stage, action owner, docs/action, and lender, with close date secondary", () => {
    const deal = resiDeal();
    const mover = fileMover(deal);
    expect(mover.fileNumber).toBe("FF-T");
    expect(mover.stage).toBe("lawyer-signing");
    expect(mover.actionOwner).toBe("Finley Compliance");
    expect(mover.docsAction).toBe(docsActionLine(deal));
    expect(mover.docsAction).toMatch(/AML \/ ID verification/);
    expect(mover.docsAction).toMatch(/1 open condition/);
    expect(mover.lender).toBe("Northpine Bank");
    expect(mover.closeDate).toBe("2026-10-15");
  });
});

describe("unlicensed assistant still cannot record funding confirm", () => {
  it("lets LO and UW record a funding confirm and blocks Assistant", () => {
    expect(canRecordFundingConfirm("lo")).toBe(true);
    expect(canRecordFundingConfirm("uw")).toBe(true);
    expect(canRecordFundingConfirm("assistant")).toBe(false);
    expect(canRecordFundingConfirm("compliance")).toBe(false);
    expect(canRecordFundingConfirm("marketing")).toBe(false);
  });
});

describe("overlay seed", () => {
  it("seeds a lawyer-signing file with a close date that is not funded, and a funded file with a funding confirm", () => {
    const deals = seedDeals();
    const parker = deals.find((deal) => primaryBorrower(deal).name === "Parker Placeholder");
    expect(parker?.stage).toBe("lawyer-signing");
    expect(parker?.closeDate).toBeTruthy();
    expect(parker?.fundedAt).toBeNull();
    expect(parker?.fundingConfirmRef).toBeNull();
    expect(isFundedInFileflow(parker!)).toBe(false);
    const hoi = closePackRows(parker!).find((row) => row.id === "hoi-binder");
    expect(hoi?.status).toBe("open");
    expect(sopColumnRows(parker!).map((row) => row.id)).toEqual([...SOP_COLUMN_IDS]);

    const skyler = deals.find((deal) => primaryBorrower(deal).name === "Skyler Placeholder");
    expect(skyler?.stage).toBe("funded");
    expect(skyler?.fundedAt).toBeTruthy();
    expect(skyler?.fundingConfirmRef).toMatch(/FC-SKYLER/);
    expect(isFundedInFileflow(skyler!)).toBe(true);

    const drew = deals.find((deal) => primaryBorrower(deal).name === "Drew Mockwell");
    expect(drew?.stage).toBe("review");
    expect(isFundedInFileflow(drew!)).toBe(true);
  });

  it("seeds an On Hold open file that is not funded, and an Inactive terminal file", () => {
    const deals = seedDeals();
    const haven = deals.find((deal) => primaryBorrower(deal).name === "Haven Holdfile");
    expect(haven?.stage).toBe("on-hold");
    expect(haven?.closeDate).toBeTruthy();
    expect(isFundedInFileflow(haven!)).toBe(false);
    expect(haven?.nextAction.title.length).toBeGreaterThan(0);

    const idris = deals.find((deal) => primaryBorrower(deal).name === "Idris Coldfile");
    expect(idris?.stage).toBe("inactive");
    expect(isFundedInFileflow(idris!)).toBe(false);
    expect(idris?.nextAction.title).toMatch(/inactive/i);
  });
});
