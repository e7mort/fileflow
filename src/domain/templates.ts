import type { Book, Stage, TaskTemplate } from "../types";

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "tpl-income-docs",
    title: "Collect income docs",
    books: ["residential"],
    unlockStages: ["lead", "application"],
    order: 10,
  },
  {
    id: "tpl-application-package",
    title: "Build application package",
    books: ["residential"],
    unlockStages: ["application"],
    order: 20,
  },
  {
    id: "tpl-stress-test",
    title: "Record stress test / qualifying rate",
    books: ["residential"],
    unlockStages: ["application"],
    order: 25,
  },
  {
    id: "tpl-submit-lender",
    title: "Submit to lender",
    books: ["residential", "commercial", "private"],
    unlockStages: ["application"],
    order: 30,
  },
  {
    id: "tpl-commitment",
    title: "Receive and review commitment",
    books: ["residential", "commercial", "private"],
    unlockStages: ["submitted", "conditional"],
    order: 40,
  },
  {
    id: "tpl-appraisal",
    title: "Order appraisal",
    books: ["residential", "commercial"],
    unlockStages: ["submitted", "conditional"],
    order: 50,
  },
  {
    id: "tpl-title",
    title: "Title search",
    books: ["residential"],
    unlockStages: ["conditional"],
    order: 60,
  },
  {
    id: "tpl-outstanding",
    title: "Clear outstanding conditions",
    books: ["residential", "commercial"],
    unlockStages: ["conditional"],
    order: 70,
  },
  {
    id: "tpl-insurance",
    title: "Confirm property insurance",
    books: ["residential", "private"],
    unlockStages: ["conditional", "clear-to-close"],
    order: 80,
  },
  {
    id: "tpl-lawyer",
    title: "Instruct lawyer / solicitor",
    books: ["residential", "commercial"],
    unlockStages: ["conditional", "clear-to-close"],
    order: 90,
  },
  {
    id: "tpl-rent-roll",
    title: "Collect rent roll and leases",
    books: ["commercial"],
    unlockStages: ["lead", "application"],
    order: 12,
  },
  {
    id: "tpl-noi",
    title: "Complete NOI worksheet",
    books: ["commercial"],
    unlockStages: ["application"],
    order: 18,
  },
  {
    id: "tpl-dscr",
    title: "Record DSCR",
    books: ["commercial"],
    unlockStages: ["application", "submitted"],
    order: 22,
  },
  {
    id: "tpl-environmental",
    title: "Environmental / Phase I",
    books: ["commercial"],
    unlockStages: ["submitted", "conditional"],
    order: 55,
  },
  {
    id: "tpl-term-sheet",
    title: "Issue term sheet",
    books: ["private"],
    unlockStages: ["lead", "application"],
    order: 11,
  },
  {
    id: "tpl-exit",
    title: "Document exit strategy",
    books: ["private"],
    unlockStages: ["application"],
    order: 16,
  },
  {
    id: "tpl-broker-fee",
    title: "Broker fee agreement",
    books: ["private"],
    unlockStages: ["application"],
    order: 19,
  },
  {
    id: "tpl-private-lawyer",
    title: "Instruct lawyer / solicitor",
    books: ["private"],
    unlockStages: ["application", "conditional"],
    order: 24,
  },
  {
    id: "tpl-second-position",
    title: "Title / second-position search",
    books: ["private"],
    unlockStages: ["application", "conditional"],
    order: 26,
  },
];

export function templatesForBook(book: Book): TaskTemplate[] {
  return TASK_TEMPLATES.filter((template) => template.books.includes(book)).sort(
    (a, b) => a.order - b.order,
  );
}

export function earliestUnlockIndex(unlockStages: Stage[]): number {
  return Math.min(
    ...unlockStages.map((stage) => {
      const order = [
        "lead",
        "application",
        "submitted",
        "conditional",
        "clear-to-close",
        "funded",
        "fallen-through",
      ] as const;
      return order.indexOf(stage);
    }),
  );
}
