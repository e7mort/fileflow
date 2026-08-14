import type { Deal, Handoff, PersonId, Stage } from "../types";
import { addMention, assignNextAction, instantiateTasks, setHandoff } from "./engine";

function markDone(deal: Deal, templateIds: string[]): Deal {
  return {
    ...deal,
    tasks: deal.tasks.map((task) =>
      templateIds.includes(task.templateId)
        ? { ...task, completed: true, completedAt: "2026-07-15T12:00:00.000Z" }
        : task,
    ),
  };
}

function assignOwners(
  deal: Deal,
  owners: Partial<Record<string, PersonId | null>>,
): Deal {
  return {
    ...deal,
    tasks: deal.tasks.map((task) => ({
      ...task,
      ownerId: owners[task.templateId] ?? task.ownerId,
    })),
  };
}

function finish(deal: Deal, stage: Stage, handoff?: Handoff): Deal {
  const next = assignNextAction({ ...deal, stage });
  return handoff ? setHandoff(next, handoff) : next;
}

export function seedDeals(): Deal[] {
  const alex = finish(
      assignOwners(
        {
          id: "d-alex",
          book: "residential",
          stage: "application",
          borrower: {
            name: "Alex Example",
            email: "alex.example@example.test",
            phone: "416-555-0101",
          },
          property: { address: "14 Example Lane, Demo City ON M5V 0A1" },
          lender: "Northpine Bank",
          product: "5-year fixed",
          amount: 612000,
          closeDate: "2026-10-15",
          conditions: ["Proof of down payment", "Employment letter"],
          purpose: "purchase",
          insurance: "uninsured",
          stressTest: { kind: "status", status: "pending" },
          nextAction: {
            taskId: null,
            title: "",
            ownerId: null,
            due: null,
            waitingOn: null,
          },
          tasks: instantiateTasks({ book: "residential" }),
          mentions: [],
        },
        { "tpl-income-docs": "p-morgan", "tpl-application-package": "p-riley" },
      ),
    "application",
    {
      personId: "p-riley",
      reason: "Processor to chase T4s and employment letter",
      due: "2026-08-18",
    },
  );

  const jordan = finish(
      markDone(
        assignOwners(
          {
            id: "d-jordan",
            book: "residential",
            stage: "submitted",
            borrower: {
              name: "Jordan Demo",
              email: "jordan.demo@example.test",
              phone: "604-555-0144",
            },
            property: { address: "88 Placeholder Ave, Sampleville BC V6B 1A1" },
            lender: "Harbour Credit Union",
            product: "5-year variable",
            amount: 440000,
            closeDate: "2026-09-28",
            conditions: ["Updated mortgage statement", "Property insurance binder"],
            purpose: "refinance",
            insurance: "insured",
            stressTest: { kind: "value", qualifyingRate: 5.25 },
            nextAction: {
              taskId: null,
              title: "",
              ownerId: null,
              due: null,
              waitingOn: null,
            },
            tasks: instantiateTasks({ book: "residential" }),
            mentions: [],
          },
          { "tpl-commitment": "p-casey", "tpl-appraisal": "p-riley" },
        ),
        [
          "tpl-income-docs",
          "tpl-application-package",
          "tpl-stress-test",
          "tpl-submit-lender",
        ],
      ),
    "submitted",
    {
      personId: "p-casey",
      reason: "Underwriter to review the commitment once it lands",
      due: "2026-08-22",
    },
  );

  const sidney = finish(
    markDone(
      assignOwners(
        {
          id: "d-sam",
          book: "residential",
          stage: "conditional",
          borrower: {
            name: "Sidney Sample",
            email: "sidney.sample@example.test",
            phone: "905-555-0188",
          },
          property: { address: "3 Fiction Court, Mocktown ON L6A 0A1" },
          lender: "Cedar Trust",
          product: "3-year fixed",
          amount: 385000,
          closeDate: "2026-09-10",
          conditions: ["Remaining income docs", "Solicitor contact"],
          purpose: "renewal",
          insurance: "uninsured",
          stressTest: { kind: "status", status: "passed" },
          nextAction: {
            taskId: null,
            title: "",
            ownerId: null,
            due: null,
            waitingOn: null,
          },
          tasks: instantiateTasks({ book: "residential" }),
          mentions: [],
        },
        { "tpl-outstanding": "p-casey", "tpl-title": "p-riley" },
      ),
      [
        "tpl-income-docs",
        "tpl-application-package",
        "tpl-stress-test",
        "tpl-submit-lender",
        "tpl-commitment",
        "tpl-appraisal",
      ],
    ),
    "conditional",
  );

  const parker = finish(
      markDone(
        assignOwners(
          {
            id: "d-quinn",
            book: "residential",
            stage: "clear-to-close",
            borrower: {
              name: "Parker Placeholder",
              email: "parker.placeholder@example.test",
              phone: "613-555-0162",
            },
            property: { address: "50 Demo Sideroad, Faketown ON K1A 0A1" },
            lender: "Northpine Bank",
            product: "5-year fixed",
            amount: 528000,
            closeDate: "2026-08-27",
            conditions: ["Insurance binder to lawyer"],
            purpose: "switch",
            insurance: "uninsured",
            stressTest: { kind: "value", qualifyingRate: 5.25 },
            nextAction: {
              taskId: null,
              title: "",
              ownerId: null,
              due: null,
              waitingOn: null,
            },
            tasks: instantiateTasks({ book: "residential" }),
            mentions: [],
          },
          { "tpl-lawyer": "p-riley", "tpl-insurance": "p-riley" },
        ),
        [
          "tpl-income-docs",
          "tpl-application-package",
          "tpl-stress-test",
          "tpl-submit-lender",
          "tpl-commitment",
          "tpl-appraisal",
          "tpl-title",
          "tpl-outstanding",
        ],
      ),
    "clear-to-close",
    {
      personId: "p-riley",
      reason: "Confirm lawyer has the insurance binder",
      due: "2026-08-20",
    },
  );

  const robin = finish(
    {
      id: "d-robin",
      book: "residential",
      stage: "lead",
      borrower: {
        name: "Robin Fiction",
        email: "robin.fiction@example.test",
        phone: "519-555-0117",
      },
      property: { address: "9 Sample Crescent, Example Mills ON N2L 0A1" },
      lender: "Not assigned",
      product: "Not selected",
      amount: 475000,
      closeDate: null,
      conditions: [],
      purpose: "purchase",
      insurance: "insured",
      stressTest: { kind: "status", status: "pending" },
      nextAction: {
        taskId: null,
        title: "",
        ownerId: null,
        due: null,
        waitingOn: null,
      },
      tasks: instantiateTasks({ book: "residential" }),
      mentions: [],
    },
    "lead",
  );

  const skyler = finish(
    markDone(
      {
        id: "d-skyler",
        book: "residential",
        stage: "funded",
        borrower: {
          name: "Skyler Placeholder",
          email: "skyler.placeholder@example.test",
          phone: "705-555-0190",
        },
        property: { address: "21 Mockingbird Way, Testham ON P3A 0A1" },
        lender: "Harbour Credit Union",
        product: "5-year fixed",
        amount: 390000,
        closeDate: "2026-07-30",
        conditions: [],
        purpose: "purchase",
        insurance: "insured",
        stressTest: { kind: "status", status: "passed" },
        nextAction: {
          taskId: null,
          title: "",
          ownerId: null,
          due: null,
          waitingOn: null,
        },
        tasks: instantiateTasks({ book: "residential" }),
        mentions: [],
      },
      [
        "tpl-income-docs",
        "tpl-application-package",
        "tpl-stress-test",
        "tpl-submit-lender",
        "tpl-commitment",
        "tpl-appraisal",
        "tpl-title",
        "tpl-outstanding",
        "tpl-insurance",
        "tpl-lawyer",
      ],
    ),
    "funded",
  );

  const avery = finish(
    assignOwners(
      {
        id: "d-avery",
        book: "commercial",
        stage: "application",
        borrower: {
          name: "Avery Showcase",
          email: "avery.showcase@example.test",
          phone: "416-555-0173",
        },
        property: { address: "200 Fiction Plaza, Test Harbour ON M5J 0A1" },
        lender: "Summit Commercial",
        product: "5-year commercial term",
        amount: 1850000,
        closeDate: "2026-11-12",
        conditions: ["Current rent roll", "Corporate search"],
        dscr: 1.28,
        noi: 186000,
        nextAction: {
          taskId: null,
          title: "",
          ownerId: null,
          due: null,
          waitingOn: null,
        },
        tasks: instantiateTasks({ book: "commercial" }),
        mentions: [],
      },
      { "tpl-rent-roll": "p-morgan", "tpl-noi": "p-morgan", "tpl-dscr": "p-casey" },
    ),
    "application",
  );

  const cameron = finish(
      markDone(
        assignOwners(
          {
            id: "d-cameron",
            book: "commercial",
            stage: "conditional",
            borrower: {
              name: "Cameron Testfile",
              email: "cameron.testfile@example.test",
              phone: "403-555-0135",
            },
            property: { address: "77 Ledger Street, Fakebridge AB T2P 0A1" },
            lender: "Prairie Ledger Bank",
            product: "3-year commercial term",
            amount: 2400000,
            closeDate: "2026-10-02",
            conditions: ["Updated rent roll", "Environmental questionnaire"],
            dscr: 1.41,
            noi: 312000,
            nextAction: {
              taskId: null,
              title: "",
              ownerId: null,
              due: null,
              waitingOn: null,
            },
            tasks: instantiateTasks({ book: "commercial" }),
            mentions: [],
          },
          { "tpl-outstanding": "p-casey", "tpl-environmental": "p-riley" },
        ),
        ["tpl-rent-roll", "tpl-noi", "tpl-dscr", "tpl-submit-lender", "tpl-commitment"],
      ),
    "conditional",
    {
      personId: "p-riley",
      reason: "Need the current rent roll from the borrower",
      due: "2026-08-19",
    },
  );

  const drew = finish(
    markDone(
      {
        id: "d-drew",
        book: "commercial",
        stage: "funded",
        borrower: {
          name: "Drew Mockwell",
          email: "drew.mockwell@example.test",
          phone: "514-555-0128",
        },
        property: { address: "12 Showcase Blvd, Examplaire QC H3B 0A1" },
        lender: "Summit Commercial",
        product: "5-year commercial term",
        amount: 1600000,
        closeDate: "2026-06-18",
        conditions: [],
        dscr: 1.35,
        noi: 204000,
        nextAction: {
          taskId: null,
          title: "",
          ownerId: null,
          due: null,
          waitingOn: null,
        },
        tasks: instantiateTasks({ book: "commercial" }),
        mentions: [],
      },
      [
        "tpl-rent-roll",
        "tpl-noi",
        "tpl-dscr",
        "tpl-submit-lender",
        "tpl-commitment",
        "tpl-appraisal",
        "tpl-environmental",
        "tpl-outstanding",
        "tpl-lawyer",
      ],
    ),
    "funded",
  );

  const harper = finish(
      assignOwners(
        {
          id: "d-harper",
          book: "private",
          stage: "application",
          borrower: {
            name: "Harper Fictional",
            email: "harper.fictional@example.test",
            phone: "647-555-0155",
          },
          property: { address: "4 Second Position Rd, Demo Heights ON L4B 0A1" },
          lender: "Oakbridge Private",
          product: "12-month private",
          amount: 220000,
          closeDate: "2026-09-04",
          conditions: ["Signed broker fee agreement", "Exit letter"],
          termMonths: 12,
          exitStrategy: "Refinance to an A lender after 10 months",
          brokerFee: 4800,
          lawyer: "Pat Solicitor (fictional)",
          position: "second",
          nextAction: {
            taskId: null,
            title: "",
            ownerId: null,
            due: null,
            waitingOn: null,
          },
          tasks: instantiateTasks({ book: "private" }),
          mentions: [],
        },
        { "tpl-term-sheet": "p-morgan", "tpl-exit": "p-morgan", "tpl-private-lawyer": "p-riley" },
      ),
    "application",
    {
      personId: "p-riley",
      reason: "Lawyer package for the second-position search",
      due: "2026-08-17",
    },
  );

  const reese = finish(
    markDone(
      assignOwners(
        {
          id: "d-reese",
          book: "private",
          stage: "submitted",
          borrower: {
            name: "Reese Demoaddr",
            email: "reese.demoaddr@example.test",
            phone: "780-555-0199",
          },
          property: { address: "16 Placeholder Trail, Sample Ridge AB T5J 0A1" },
          lender: "Oakbridge Private",
          product: "6-month private",
          amount: 175000,
          closeDate: "2026-08-31",
          conditions: ["Lawyer confirmation of first-position postponement"],
          termMonths: 6,
          exitStrategy: "Sale of the property at the end of term",
          brokerFee: 3500,
          lawyer: "Kim Notary (fictional)",
          position: "first",
          nextAction: {
            taskId: null,
            title: "",
            ownerId: null,
            due: null,
            waitingOn: null,
          },
          tasks: instantiateTasks({ book: "private" }),
          mentions: [],
        },
        { "tpl-commitment": "p-riley" },
      ),
      ["tpl-term-sheet", "tpl-exit", "tpl-broker-fee", "tpl-submit-lender"],
    ),
    "submitted",
  );

  const blake = finish(
    {
      id: "d-blake",
      book: "private",
      stage: "fallen-through",
      borrower: {
        name: "Blake Exampleton",
        email: "blake.exampleton@example.test",
        phone: "902-555-0140",
      },
      property: { address: "1 Fallen Lane, Dummy Port NS B3H 0A1" },
      lender: "Oakbridge Private",
      product: "12-month private",
      amount: 150000,
      closeDate: null,
      conditions: ["Borrower withdrew after the term sheet"],
      termMonths: 12,
      exitStrategy: "Was a refinance; file stopped",
      brokerFee: 3000,
      lawyer: null,
      position: "second",
      nextAction: {
        taskId: null,
        title: "",
        ownerId: null,
        due: null,
        waitingOn: null,
      },
      tasks: instantiateTasks({ book: "private" }),
      mentions: [],
    },
    "fallen-through",
  );

  const withNotes = [
    addMention(alex, {
      authorId: "p-morgan",
      body: "@Riley can you pull the T4s this afternoon?",
      createdAt: "2026-08-13T14:10:00.000Z",
    }),
    addMention(jordan, {
      authorId: "p-riley",
      body: "Submission is in. @Casey this one is waiting on you for the commitment.",
      createdAt: "2026-08-12T16:40:00.000Z",
    }),
    addMention(avery, {
      authorId: "p-morgan",
      body: "NOI is in the worksheet. @Casey please sanity-check DSCR before we submit.",
      createdAt: "2026-08-11T11:05:00.000Z",
    }),
    addMention(harper, {
      authorId: "p-morgan",
      body: "Second-position file. @Riley please send the lawyer the title ask.",
      createdAt: "2026-08-14T09:20:00.000Z",
    }),
  ];

  return [
    withNotes[0] ?? alex,
    withNotes[1] ?? jordan,
    sidney,
    parker,
    robin,
    skyler,
    withNotes[2] ?? avery,
    cameron,
    drew,
    withNotes[3] ?? harper,
    reese,
    blake,
  ];
}
