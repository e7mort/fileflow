import { describe, expect, it } from "vitest";
import { ROLES, STAGES, alignedFileIdentity, type ResidentialDeal, type Task } from "../types";
import { instantiateTasks, isTaskUnlocked, moveStage } from "./engine";
import { DEMO_TODAY } from "./maturity";
import { teamMyDay } from "./myday";
import { primaryBorrower } from "./parties";
import {
  canAdvanceToFunded,
  canCompleteTask,
  canEditDocList,
  canMutateFiles,
  roleLabel,
  stageAdvanceBlock,
  TEAM,
} from "./team";
import { seedDeals } from "./seed";
import { isFundedInFileflow } from "./invoice";
import { isTerminalStage, STAGE_LABELS, STAGE_NOTES } from "./stages";

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
    conditions: [],
    purpose: "purchase",
    insurance: "uninsured",
    stressTest: { kind: "status", status: "pending" },
    nextAction: {
      taskId: null,
      title: "Confirm lawyer, title, and insurance",
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

describe("shop roles", () => {
  it("exposes LO, Assistant, UW, Compliance, and Marketing seats", () => {
    expect([...ROLES]).toEqual(["lo", "assistant", "uw", "compliance", "marketing"]);
    expect(TEAM.map((person) => person.role)).toEqual([
      "lo",
      "assistant",
      "uw",
      "compliance",
      "marketing",
    ]);
    expect(roleLabel("lo")).toBe("LO");
    expect(roleLabel("assistant")).toBe("Assistant");
    expect(roleLabel("uw")).toBe("UW");
    expect(TEAM.some((person) => person.name === "Finley Compliance")).toBe(true);
    expect(
      TEAM.every((person) => !/^(sam|samuel|quinn|james|eric|e7)$/i.test(person.name.split(" ")[0] ?? "")),
    ).toBe(true);
  });

  it("lets Compliance complete AML items and blocks Marketing from file mutations", () => {
    const aml = task({
      id: "t-aml",
      title: "AML / ID verification",
      kind: "compliance",
    });
    const income = task({ id: "t-inc", title: "Collect income docs", kind: "standard" });
    expect(canMutateFiles("marketing")).toBe(false);
    expect(canMutateFiles("compliance")).toBe(true);
    expect(canCompleteTask("marketing", aml)).toBe(false);
    expect(canCompleteTask("compliance", aml)).toBe(true);
    expect(canCompleteTask("compliance", income)).toBe(false);
    expect(canCompleteTask("lo", income)).toBe(true);
  });
});

describe("canada board", () => {
  it("uses the Canada pipeline and keeps Fallen through, On Hold, and Inactive as side doors", () => {
    expect(STAGES).toEqual([
      "lead",
      "discovery",
      "pre-approval",
      "application",
      "lender-uw",
      "conditional",
      "file-complete",
      "instructions",
      "lawyer-signing",
      "funded",
      "review",
      "fallen-through",
      "on-hold",
      "inactive",
    ]);
    expect(STAGE_LABELS["lender-uw"]).toBe("Lender UW");
    expect(STAGE_LABELS["lawyer-signing"]).toBe("Lawyer signing");
    expect(STAGE_LABELS["on-hold"]).toBe("On Hold");
    expect(STAGE_LABELS.inactive).toBe("Inactive");
    expect(STAGE_NOTES["lender-uw"]).toMatch(/lender owns this column/i);
    expect(STAGE_NOTES["lawyer-signing"]).toMatch(/not funded/i);
    expect(STAGE_NOTES["pre-approval"]).toMatch(/rate hold is not approval/i);
    expect(STAGE_NOTES["on-hold"]).toMatch(/not funded/i);
    expect(isTerminalStage("lawyer-signing")).toBe(false);
    expect(isTerminalStage("funded")).toBe(false);
    expect(isTerminalStage("review")).toBe(false);
    expect(isTerminalStage("on-hold")).toBe(false);
    expect(isTerminalStage("fallen-through")).toBe(true);
    expect(isTerminalStage("inactive")).toBe(true);
  });
});

describe("stage-gated docs", () => {
  it("labels public CA checklists on the residential spine", () => {
    const titles = instantiateTasks({ book: "residential" }).map((item) => item.title);
    expect(titles).toContain("Pre-approval · Collect ID");
    expect(titles).toContain("Pre-approval · 2 pay stubs");
    expect(titles).toContain("Pre-approval · Letter of employment (≤30 days)");
    expect(titles).toContain("Pre-approval · T4");
    expect(titles).toContain("Pre-approval · NOA");
    expect(titles).toContain("Pre-approval · Debts list");
    expect(titles).toContain("Pre-approval · 90-day down payment");
    expect(titles).toContain("Pre-approval · Gift letter");
    expect(titles).toContain("Application · PSA + amendments");
    expect(titles).toContain("Application · MLS listing");
    expect(titles).toContain("Application · Deposit confirmation");
    expect(titles).toContain("Application · Realtor + lawyer names");
    expect(titles).toContain("Application · Appraisal");
    expect(titles).toContain("Application · Condo status (if any)");
    expect(titles).toContain("Application · Void cheque");
    expect(titles).toContain("Application · Names match");
    expect(titles).toContain("Application · Official PDFs");
    expect(titles).toContain("Conditional · Signed commitment");
    expect(titles).toContain("Conditional · Disclosures");
    expect(titles).toContain("Conditional · Condition list");
    expect(titles).toContain("File complete · Fresh stubs / employment letter");
    expect(titles).toContain("File complete · HOI in progress");
    expect(titles).toContain("Instructions · Mortgage registration instructions to lawyer");
    expect(titles).toContain("Instructions · Financing-condition removal / NOF");
    expect(titles).toContain("Lawyer signing · HOI binder with loss payee (before funds)");
    expect(titles).toContain("Lawyer signing · Wet Charge");
    expect(titles).toContain("Lawyer signing · Down payment + costs in trust");
    expect(titles).toContain("Lawyer signing · AML / ID verification");
    expect(titles).toContain("Funded · Funding confirm");
    expect(titles).toContain("Funded · Closing statement");
    expect(titles).toContain("Funded · Registered charge");
    expect(titles).toContain("Review · Completeness + 7-year file / 5-year FINTRAC");
    expect(titles).toContain("Review · Lawyer report");
    expect(titles).toContain("Review · Match lender invoice (commission / payout)");
    expect(titles).not.toContain("Submit to Filogix");
  });

  it("keeps commercial and private extras beside the generic docs", () => {
    const commercial = instantiateTasks({ book: "commercial" }).map((item) => item.title);
    expect(commercial).toContain("Pre-approval · Collect ID");
    expect(commercial).toContain("Collect rent roll and leases");
    expect(commercial).toContain("Review · Match lender invoice (commission / payout)");
    const privateTitles = instantiateTasks({ book: "private" }).map((item) => item.title);
    expect(privateTitles).toContain("Pre-approval · Collect ID");
    expect(privateTitles).toContain("Document exit strategy");
    expect(privateTitles).toContain("Review · Completeness + 7-year file / 5-year FINTRAC");
  });

  it("locks property docs at pre-approval and leftover income work at funded", () => {
    const psa = task({
      id: "t-psa",
      title: "Application · PSA + amendments",
      unlockStages: ["application"],
    });
    const invoice = task({
      id: "t-inv",
      title: "Review · Match lender invoice (commission / payout)",
      unlockStages: ["review"],
    });
    const stubs = task({
      id: "t-stubs",
      title: "Pre-approval · 2 pay stubs",
      unlockStages: ["pre-approval"],
    });
    expect(isTaskUnlocked(psa, "pre-approval")).toBe(false);
    expect(isTaskUnlocked(psa, "application")).toBe(true);
    expect(isTaskUnlocked(invoice, "review")).toBe(true);
    expect(isTaskUnlocked(stubs, "funded")).toBe(false);
    expect(isTaskUnlocked(stubs, "fallen-through")).toBe(false);
    expect(isTaskUnlocked(stubs, "inactive")).toBe(false);
    expect(isTaskUnlocked(stubs, "on-hold")).toBe(true);
    expect(isTaskUnlocked(invoice, "on-hold")).toBe(false);
  });
});

describe("shop UW vs lender UW and assistant gates", () => {
  it("does not let shop UW own the Lender UW column, and Marketing still cannot own files", () => {
    expect(roleLabel("uw")).toBe("UW");
    expect(STAGE_NOTES["lender-uw"]).toMatch(/not shop UW/i);
    expect(canMutateFiles("marketing")).toBe(false);
    expect(canEditDocList("marketing")).toBe(false);
  });

  it("lets Assistant chase named income docs, not vet PSA, discuss commitments, or act as UW", () => {
    const stubs = task({
      id: "t-stubs",
      templateId: "tpl-pay-stubs",
      title: "Pre-approval · 2 pay stubs",
      kind: "standard",
    });
    const psa = task({
      id: "t-psa",
      templateId: "tpl-psa",
      title: "Application · PSA + amendments",
      kind: "standard",
    });
    const commitment = task({
      id: "t-commit",
      templateId: "tpl-commitment",
      title: "Conditional · Signed commitment",
      kind: "standard",
    });
    const fileComplete = task({
      id: "t-complete",
      templateId: "tpl-fresh-stubs",
      title: "File complete · Fresh stubs / employment letter",
      kind: "standard",
    });
    expect(canCompleteTask("assistant", stubs)).toBe(true);
    expect(canCompleteTask("assistant", psa)).toBe(false);
    expect(canCompleteTask("assistant", commitment)).toBe(false);
    expect(canCompleteTask("assistant", fileComplete)).toBe(false);
    expect(canCompleteTask("lo", psa)).toBe(true);
    expect(canCompleteTask("uw", fileComplete)).toBe(true);
    expect(canEditDocList("assistant")).toBe(false);
    expect(canEditDocList("lo")).toBe(true);
    expect(stageAdvanceBlock(resiDeal({ stage: "pre-approval" }), "application", "assistant")).toMatch(
      /cannot accept an application/i,
    );
    expect(stageAdvanceBlock(resiDeal({ stage: "pre-approval" }), "application", "lo")).toBeNull();
  });
});

describe("lawyer-signing is not funded", () => {
  it("blocks a move to Funded while AML verification is open", () => {
    const deal = resiDeal({
      stage: "lawyer-signing",
      tasks: [
        task({
          id: "t-aml",
          templateId: "tpl-aml-check",
          title: "Lawyer signing · AML / ID verification",
          unlockStages: ["lawyer-signing"],
          kind: "compliance",
        }),
      ],
    });
    expect(canAdvanceToFunded(deal, "funded")).toBe(false);
    expect(canAdvanceToFunded(deal, "review")).toBe(false);
    expect(canAdvanceToFunded(deal, "instructions")).toBe(true);
    const cleared = { ...deal, tasks: deal.tasks.map((item) => ({ ...item, completed: true })) };
    expect(canAdvanceToFunded(cleared, "funded")).toBe(true);
    expect(stageAdvanceBlock(cleared, "funded", "lo")).toMatch(/HOI binder/i);
  });

  it("does not treat review close-out AML as a funded gate", () => {
    const deal = resiDeal({
      tasks: [
        task({
          id: "t-close",
          templateId: "tpl-aml-closeout",
          title: "AML / compliance close-out",
          unlockStages: ["review"],
          kind: "compliance",
        }),
      ],
    });
    expect(canAdvanceToFunded(deal, "funded")).toBe(true);
  });

  it("blocks Funded while HOI binder is open, even when AML is done", () => {
    const deal = resiDeal({
      stage: "lawyer-signing",
      fundedAt: "2026-08-14",
      fundingConfirmRef: "FC-TEST",
      tasks: [
        task({
          id: "t-aml",
          templateId: "tpl-aml-check",
          title: "Lawyer signing · AML / ID verification",
          unlockStages: ["lawyer-signing"],
          kind: "compliance",
          completed: true,
        }),
        task({
          id: "t-hoi",
          templateId: "tpl-hoi-binder",
          title: "Lawyer signing · HOI binder with loss payee (before funds)",
          unlockStages: ["lawyer-signing"],
        }),
      ],
    });
    expect(stageAdvanceBlock(deal, "funded", "lo")).toMatch(/HOI binder/i);
    expect(stageAdvanceBlock(deal, "review", "lo")).toMatch(/HOI binder/i);
    const hoiDone = { ...deal, tasks: deal.tasks.map((item) => ({ ...item, completed: true })) };
    expect(stageAdvanceBlock(hoiDone, "funded", "lo")).toBeNull();
  });

  it("blocks Funded without a funding confirm even when close date and AML/HOI are done", () => {
    const deal = resiDeal({
      stage: "lawyer-signing",
      closeDate: "2026-08-27",
      fundedAt: null,
      fundingConfirmRef: null,
      mosCloseDate: "2026-08-01",
      tasks: [
        task({
          id: "t-aml",
          templateId: "tpl-aml-check",
          title: "Lawyer signing · AML / ID verification",
          unlockStages: ["lawyer-signing"],
          kind: "compliance",
          completed: true,
        }),
        task({
          id: "t-hoi",
          templateId: "tpl-hoi-binder",
          title: "Lawyer signing · HOI binder with loss payee (before funds)",
          unlockStages: ["lawyer-signing"],
          completed: true,
        }),
      ],
    });
    expect(stageAdvanceBlock(deal, "funded", "lo")).toMatch(/funding confirm required/i);
    expect(stageAdvanceBlock(deal, "funded", "lo")).toMatch(/close date is not proof/i);
    expect(
      stageAdvanceBlock({ ...deal, fundedAt: "2026-08-14" }, "funded", "lo"),
    ).toBeNull();
  });
});

describe("team my day", () => {
  it("returns one loudest file per shop role from the seed", () => {
    const rows = teamMyDay(seedDeals(), DEMO_TODAY);
    expect(rows.map((row) => row.role)).toEqual([
      "lo",
      "assistant",
      "uw",
      "compliance",
      "marketing",
    ]);
    const byRole = Object.fromEntries(rows.map((row) => [row.role, row]));
    expect(primaryBorrower(byRole.lo?.deal!).name).toBe("Alex Example");
    expect(primaryBorrower(byRole.assistant?.deal!).name).toBe("Harper Fictional");
    expect(primaryBorrower(byRole.uw?.deal!).name).toBe("Jordan Demo");
    expect(primaryBorrower(byRole.compliance?.deal!).name).toBe("Parker Placeholder");
    expect(byRole.uw?.note).toMatch(/shop UW/i);
    expect(byRole.marketing?.deal).toBeTruthy();
    expect(byRole.marketing?.readOnly).toBe(true);
  });
});

describe("seed spine", () => {
  it("seeds Canada stages, a pre-approval with no property docs, and a lawyer-signing file that is not funded", () => {
    const deals = seedDeals();
    for (const stage of STAGES) {
      expect(deals.some((deal) => deal.stage === stage)).toBe(true);
    }
    const remy = deals.find((deal) => primaryBorrower(deal).name === "Remy Ratehold");
    expect(remy?.stage).toBe("pre-approval");
    expect(remy?.property.address).toBeNull();
    const remyTitles = remy?.tasks.filter((task) => isTaskUnlocked(task, remy.stage)).map((task) => task.title) ?? [];
    expect(remyTitles.some((title) => /PSA|MLS|appraisal/i.test(title))).toBe(false);
    expect(remyTitles.some((title) => title.startsWith("Pre-approval ·"))).toBe(true);

    const parker = deals.find((deal) => primaryBorrower(deal).name === "Parker Placeholder");
    expect(parker?.stage).toBe("lawyer-signing");
    expect(parker?.closeDate).toBe("2026-08-27");
    expect(isFundedInFileflow(parker!)).toBe(false);
    expect(parker?.nextAction.title).toContain("AML / ID verification");
    expect(parker?.nextAction.ownerId).toBe("p-finley");

    const drew = deals.find((deal) => primaryBorrower(deal).name === "Drew Mockwell");
    expect(drew?.stage).toBe("review");
    expect(drew?.nextAction.title).toMatch(/invoice/i);
  });
});

describe("moveStage still prefers current-stage work", () => {
  it("opens signed-commitment work when a file lands in Conditional, not Lender UW leftovers", () => {
    const deal = resiDeal({
      stage: "application",
      tasks: instantiateTasks({ book: "residential" }),
    });
    expect(moveStage(deal, "conditional").nextAction.title).toBe("Conditional · Signed commitment");
    expect(moveStage(deal, "lender-uw").nextAction.title).toMatch(/lender is underwriting/i);
  });
});
