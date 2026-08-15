import { describe, expect, it } from "vitest";
import type { Deal, ResidentialDeal, Task } from "../types";
import {
  addMention,
  assignNextAction,
  clearHandoff,
  completeTask,
  instantiateTasks,
  isTaskUnlocked,
  moveStage,
  parseMentionedIds,
  setHandoff,
  workForPerson,
} from "./engine";
import { TEAM } from "./team";

function task(partial: Partial<Task> & Pick<Task, "id" | "title">): Task {
  return {
    templateId: partial.templateId ?? partial.id,
    unlockStages: partial.unlockStages ?? ["application"],
    ownerId: partial.ownerId ?? null,
    due: partial.due ?? null,
    completed: partial.completed ?? false,
    completedAt: partial.completedAt ?? null,
    ...partial,
  };
}

function resiDeal(overrides: Partial<ResidentialDeal> = {}): ResidentialDeal {
  return {
    id: "d-test",
    book: "residential",
    stage: "application",
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
        id: "c-down",
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
      title: "Complete the application package",
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

describe("instantiateTasks", () => {
  it("creates residential templates and omits commercial-only items", () => {
    const tasks = instantiateTasks({ book: "residential" });
    const titles = tasks.map((item) => item.title);
    expect(titles).toContain("Collect income docs");
    expect(titles).toContain("Build application package");
    expect(titles).not.toContain("Complete NOI worksheet");
    expect(titles).not.toContain("Document exit strategy");
  });

  it("creates commercial templates including DSCR and NOI", () => {
    const titles = instantiateTasks({ book: "commercial" }).map((item) => item.title);
    expect(titles).toContain("Complete NOI worksheet");
    expect(titles).toContain("Record DSCR");
    expect(titles).toContain("Collect rent roll and leases");
    expect(titles).not.toContain("Collect income docs");
  });

  it("creates private templates including exit, fee, and second-position", () => {
    const titles = instantiateTasks({ book: "private" }).map((item) => item.title);
    expect(titles).toContain("Document exit strategy");
    expect(titles).toContain("Broker fee agreement");
    expect(titles).toContain("Title / second-position search");
    expect(titles).not.toContain("Order appraisal");
  });
});

describe("isTaskUnlocked", () => {
  it("locks a submitted-stage task while the file is still in application", () => {
    const appraisal = task({
      id: "t-app",
      title: "Order appraisal",
      unlockStages: ["submitted", "conditional"],
    });
    expect(isTaskUnlocked(appraisal, "application")).toBe(false);
    expect(isTaskUnlocked(appraisal, "submitted")).toBe(true);
  });

  it("keeps leftover earlier tasks unlocked after the file moves forward", () => {
    const income = task({
      id: "t-inc",
      title: "Collect income docs",
      unlockStages: ["lead", "application"],
    });
    expect(isTaskUnlocked(income, "conditional")).toBe(true);
  });

  it("locks remaining work on funded and fallen-through files", () => {
    const income = task({
      id: "t-inc",
      title: "Collect income docs",
      unlockStages: ["lead", "application"],
    });
    expect(isTaskUnlocked(income, "funded")).toBe(false);
    expect(isTaskUnlocked(income, "fallen-through")).toBe(false);
  });
});

describe("assignNextAction", () => {
  it("promotes the first unlocked open task and keeps a null owner", () => {
    const deal = resiDeal({
      tasks: [
        task({
          id: "t-income",
          title: "Collect income docs",
          unlockStages: ["lead", "application"],
          ownerId: null,
        }),
        task({
          id: "t-pkg",
          title: "Build application package",
          unlockStages: ["application"],
          ownerId: "p-morgan",
        }),
      ],
    });
    const next = assignNextAction(deal).nextAction;
    expect(next.taskId).toBe("t-income");
    expect(next.title).toBe("Collect income docs");
    expect(next.ownerId).toBeNull();
  });

  it("uses the stage default and never invents an owner when no open tasks remain", () => {
    const deal = resiDeal({
      stage: "conditional",
      tasks: [
        task({
          id: "t-done",
          title: "Clear outstanding conditions",
          unlockStages: ["conditional"],
          completed: true,
        }),
      ],
    });
    const next = assignNextAction(deal).nextAction;
    expect(next.taskId).toBeNull();
    expect(next.title).toBe("Work outstanding conditions");
    expect(next.ownerId).toBeNull();
    expect(next.waitingOn).toBeNull();
  });
});

describe("completeTask", () => {
  it("marks the task done and promotes a new next action from remaining work", () => {
    const deal = resiDeal({
      nextAction: {
        taskId: "t-income",
        title: "Collect income docs",
        ownerId: "p-morgan",
        due: "2026-08-20",
        waitingOn: {
          personId: "p-riley",
          reason: "Chase T4s",
          due: "2026-08-18",
        },
      },
      tasks: [
        task({
          id: "t-income",
          title: "Collect income docs",
          unlockStages: ["lead", "application"],
          ownerId: "p-morgan",
        }),
        task({
          id: "t-pkg",
          title: "Build application package",
          unlockStages: ["application"],
          ownerId: "p-riley",
          due: "2026-08-22",
        }),
      ],
    });

    const updated = completeTask(deal, "t-income");
    expect(updated.tasks[0]?.completed).toBe(true);
    expect(updated.nextAction.taskId).toBe("t-pkg");
    expect(updated.nextAction.title).toBe("Build application package");
    expect(updated.nextAction.ownerId).toBe("p-riley");
    expect(updated.nextAction.waitingOn).toBeNull();
  });

  it("does not rewrite next action when a different task is completed", () => {
    const deal = resiDeal({
      nextAction: {
        taskId: "t-income",
        title: "Collect income docs",
        ownerId: "p-morgan",
        due: null,
        waitingOn: null,
      },
      tasks: [
        task({
          id: "t-income",
          title: "Collect income docs",
          unlockStages: ["lead", "application"],
        }),
        task({
          id: "t-pkg",
          title: "Build application package",
          unlockStages: ["application"],
        }),
      ],
    });
    const updated = completeTask(deal, "t-pkg");
    expect(updated.nextAction.taskId).toBe("t-income");
    expect(updated.tasks.find((item) => item.id === "t-pkg")?.completed).toBe(true);
  });
});

describe("moveStage", () => {
  it("refreshes next action to newly unlocked template work", () => {
    const deal = resiDeal({
      stage: "application",
      tasks: instantiateTasks({ book: "residential" }).map((item) =>
        item.templateId === "tpl-income-docs" ||
        item.templateId === "tpl-application-package" ||
        item.templateId === "tpl-stress-test" ||
        item.templateId === "tpl-submit-lender"
          ? { ...item, completed: true, completedAt: "2026-08-01" }
          : item,
      ),
    });
    const moved = moveStage(deal, "submitted");
    expect(moved.stage).toBe("submitted");
    expect(moved.nextAction.title).toBe("Receive and review commitment");
  });

  it("prefers current-stage work over leftover earlier tasks", () => {
    const deal = resiDeal({
      stage: "application",
      tasks: instantiateTasks({ book: "residential" }),
    });
    const moved = moveStage(deal, "submitted");
    expect(moved.nextAction.title).toBe("Receive and review commitment");
  });

  it("adds any missing book templates when the stage changes", () => {
    const deal = resiDeal({ tasks: [] });
    const moved = moveStage(deal, "conditional");
    expect(moved.tasks.some((item) => item.title === "Title search")).toBe(true);
  });
});

describe("handoffs", () => {
  it("sets waiting-on person, reason, and due on the current next action", () => {
    const deal = setHandoff(resiDeal(), {
      personId: "p-riley",
      reason: "Need processor to request the T4s",
      due: "2026-08-19",
    });
    expect(deal.nextAction.waitingOn).toEqual({
      personId: "p-riley",
      reason: "Need processor to request the T4s",
      due: "2026-08-19",
    });
  });

  it("clears a handoff without inventing an owner", () => {
    const deal = clearHandoff(
      setHandoff(resiDeal({ nextAction: { ...resiDeal().nextAction, ownerId: null } }), {
        personId: "p-casey",
        reason: "Underwriter review",
        due: null,
      }),
    );
    expect(deal.nextAction.waitingOn).toBeNull();
    expect(deal.nextAction.ownerId).toBeNull();
  });
});

describe("mentions", () => {
  it("parses @FirstName mentions against the shop roster", () => {
    const ids = parseMentionedIds("Need @Riley on docs and @Casey on the commitment.", TEAM);
    expect(ids).toEqual(["p-riley", "p-casey"]);
  });

  it("stores an in-app mention with author and mentioned people", () => {
    const deal = addMention(resiDeal(), {
      authorId: "p-morgan",
      body: "Handing this to @Riley for the package.",
      createdAt: "2026-08-14T12:00:00.000Z",
    });
    expect(deal.mentions).toHaveLength(1);
    expect(deal.mentions[0]?.mentionedPersonIds).toEqual(["p-riley"]);
    expect(deal.mentions[0]?.authorId).toBe("p-morgan");
  });
});

describe("workForPerson", () => {
  it("groups owned next actions, waiting-on files, and open tasks", () => {
    const owned: Deal = resiDeal({
      id: "d-owned",
      nextAction: {
        taskId: "t-1",
        title: "Collect income docs",
        ownerId: "p-morgan",
        due: null,
        waitingOn: null,
      },
      tasks: [
        task({
          id: "t-1",
          title: "Collect income docs",
          ownerId: "p-morgan",
        }),
      ],
    });
    const waiting: Deal = resiDeal({
      id: "d-wait",
      nextAction: {
        taskId: "t-2",
        title: "Order appraisal",
        ownerId: "p-riley",
        due: null,
        waitingOn: {
          personId: "p-morgan",
          reason: "Broker to confirm occupancy",
          due: "2026-08-21",
        },
      },
      tasks: [task({ id: "t-2", title: "Order appraisal", ownerId: "p-riley" })],
    });
    const work = workForPerson([owned, waiting], "p-morgan");
    expect(work.nextActions.map((deal) => deal.id)).toEqual(["d-owned"]);
    expect(work.waitingOnYou.map((deal) => deal.id)).toEqual(["d-wait"]);
    expect(work.openTasks.map((item) => item.task.id)).toEqual(["t-1"]);
  });
});
