import { describe, expect, it } from "vitest";
import { ROLES, STAGES, type ResidentialDeal, type Task } from "../types";
import { instantiateTasks, isTaskUnlocked, moveStage } from "./engine";
import { DEMO_TODAY } from "./maturity";
import { teamMyDay } from "./myday";
import { primaryBorrower } from "./parties";
import { canAdvancePastClearToClose, canCompleteTask, canMutateFiles, roleLabel, TEAM } from "./team";
import { seedDeals } from "./seed";
import { isTerminalStage, STAGE_LABELS } from "./stages";

function task(partial: Partial<Task> & Pick<Task, "id" | "title">): Task {
  return {
    templateId: partial.templateId ?? partial.id,
    unlockStages: partial.unlockStages ?? ["application"],
    ownerId: partial.ownerId ?? null,
    due: partial.due ?? null,
    completed: partial.completed ?? false,
    completedAt: partial.completedAt ?? null,
    kind: partial.kind ?? "standard",
    ...partial,
  };
}

function resiDeal(overrides: Partial<ResidentialDeal> = {}): ResidentialDeal {
  return {
    id: "d-test",
    book: "residential",
    stage: "clear-to-close",
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
    ...overrides,
  };
}

describe("shop roles", () => {
  it("exposes LO, Processor, UW, Compliance, and Marketing seats", () => {
    expect([...ROLES]).toEqual(["lo", "processor", "uw", "compliance", "marketing"]);
    expect(TEAM.map((person) => person.role)).toEqual([
      "lo",
      "processor",
      "uw",
      "compliance",
      "marketing",
    ]);
    expect(roleLabel("lo")).toBe("LO");
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

describe("review stage", () => {
  it("places Review after Funded, with Fallen through still last", () => {
    expect(STAGES).toEqual([
      "lead",
      "application",
      "submitted",
      "conditional",
      "clear-to-close",
      "funded",
      "review",
      "fallen-through",
    ]);
    expect(STAGE_LABELS.review).toBe("Review");
    expect(isTerminalStage("funded")).toBe(false);
    expect(isTerminalStage("review")).toBe(false);
    expect(isTerminalStage("fallen-through")).toBe(true);
  });
});

describe("stage-gated docs", () => {
  it("includes ID, income, commitment, appraisal, conditions, title, insurance, lawyer, and close-out", () => {
    const titles = instantiateTasks({ book: "residential" }).map((item) => item.title);
    expect(titles).toContain("Collect ID");
    expect(titles).toContain("Collect income docs");
    expect(titles).toContain("Receive and review commitment");
    expect(titles).toContain("Order appraisal");
    expect(titles).toContain("Clear outstanding conditions");
    expect(titles).toContain("Title search");
    expect(titles).toContain("Confirm property insurance");
    expect(titles).toContain("Instruct lawyer / solicitor");
    expect(titles).toContain("Confirm solicitor pickup");
    expect(titles).toContain("Match lender invoice");
    expect(titles).toContain("AML / compliance close-out");
    expect(titles).toContain("AML / ID verification");
  });

  it("keeps commercial and private extras beside the generic docs", () => {
    const commercial = instantiateTasks({ book: "commercial" }).map((item) => item.title);
    expect(commercial).toContain("Collect ID");
    expect(commercial).toContain("Collect rent roll and leases");
    expect(commercial).toContain("Match lender invoice");
    const privateTitles = instantiateTasks({ book: "private" }).map((item) => item.title);
    expect(privateTitles).toContain("Collect ID");
    expect(privateTitles).toContain("Document exit strategy");
    expect(privateTitles).toContain("AML / compliance close-out");
  });

  it("unlocks pickup and invoice-match on funded and review, not leftover income docs", () => {
    const pickup = task({
      id: "t-pick",
      title: "Confirm solicitor pickup",
      unlockStages: ["funded", "review"],
    });
    const income = task({
      id: "t-inc",
      title: "Collect income docs",
      unlockStages: ["lead", "application"],
    });
    expect(isTaskUnlocked(pickup, "funded")).toBe(true);
    expect(isTaskUnlocked(pickup, "review")).toBe(true);
    expect(isTaskUnlocked(income, "funded")).toBe(false);
    expect(isTaskUnlocked(income, "fallen-through")).toBe(false);
  });
});

describe("clear-to-close compliance gate", () => {
  it("blocks a move past Clear to close while AML verification is open", () => {
    const deal = resiDeal({
      tasks: [
        task({
          id: "t-aml",
          templateId: "tpl-aml-check",
          title: "AML / ID verification",
          unlockStages: ["clear-to-close"],
          kind: "compliance",
        }),
      ],
    });
    expect(canAdvancePastClearToClose(deal, "funded")).toBe(false);
    expect(canAdvancePastClearToClose(deal, "review")).toBe(false);
    expect(canAdvancePastClearToClose(deal, "conditional")).toBe(true);
    const cleared = { ...deal, tasks: deal.tasks.map((item) => ({ ...item, completed: true })) };
    expect(canAdvancePastClearToClose(cleared, "funded")).toBe(true);
  });

  it("does not treat funded close-out AML as a CTC gate", () => {
    const deal = resiDeal({
      tasks: [
        task({
          id: "t-close",
          templateId: "tpl-aml-closeout",
          title: "AML / compliance close-out",
          unlockStages: ["funded", "review"],
          kind: "compliance",
        }),
      ],
    });
    expect(canAdvancePastClearToClose(deal, "funded")).toBe(true);
  });
});

describe("team my day", () => {
  it("returns one loudest file per shop role from the seed", () => {
    const rows = teamMyDay(seedDeals(), DEMO_TODAY);
    expect(rows.map((row) => row.role)).toEqual([
      "lo",
      "processor",
      "uw",
      "compliance",
      "marketing",
    ]);
    const byRole = Object.fromEntries(rows.map((row) => [row.role, row]));
    expect(primaryBorrower(byRole.lo?.deal!).name).toBe("Alex Example");
    expect(primaryBorrower(byRole.processor?.deal!).name).toBe("Harper Fictional");
    expect(primaryBorrower(byRole.uw?.deal!).name).toBe("Jordan Demo");
    expect(primaryBorrower(byRole.compliance?.deal!).name).toBe("Parker Placeholder");
    expect(byRole.marketing?.deal).toBeTruthy();
    expect(byRole.marketing?.readOnly).toBe(true);
  });
});

describe("seed spine", () => {
  it("seeds a Review file and a Compliance-owned AML item", () => {
    const deals = seedDeals();
    expect(deals.some((deal) => deal.stage === "review")).toBe(true);
    expect(deals.some((deal) => primaryBorrower(deal).name === "Drew Mockwell" && deal.stage === "review")).toBe(
      true,
    );
    const parker = deals.find((deal) => primaryBorrower(deal).name === "Parker Placeholder");
    expect(parker?.stage).toBe("clear-to-close");
    expect(parker?.nextAction.title).toBe("AML / ID verification");
    expect(parker?.nextAction.ownerId).toBe("p-finley");
  });
});

describe("moveStage still prefers current-stage work", () => {
  it("opens commitment work when a file lands in Submitted", () => {
    const deal = resiDeal({
      stage: "application",
      tasks: instantiateTasks({ book: "residential" }).map((item) =>
        item.templateId === "tpl-id-docs" ||
        item.templateId === "tpl-income-docs" ||
        item.templateId === "tpl-application-package" ||
        item.templateId === "tpl-stress-test" ||
        item.templateId === "tpl-submit-lender"
          ? { ...item, completed: true, completedAt: "2026-08-01" }
          : item,
      ),
    });
    expect(moveStage(deal, "submitted").nextAction.title).toBe("Receive and review commitment");
  });
});
