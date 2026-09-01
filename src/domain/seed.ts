import {
  alignedFileIdentity,
  type Book,
  type CommercialDeal,
  type Deal,
  type FileIdentity,
  type FileParty,
  type Handoff,
  type Invoice,
  type PersonId,
  type PrivateDeal,
  type ResidentialDeal,
  type Stage,
} from "../types";
import { openConditions } from "./conditions";
import { addMention, assignNextAction, instantiateTasks, setHandoff } from "./engine";
import { stageIndex } from "./stages";
import { earliestUnlockIndex, templatesForBook } from "./templates";

function people(
  id: string,
  primary: { name: string; email: string; phone: string },
  extra: FileParty[] = [],
): FileParty[] {
  return [{ id: `${id}-b1`, role: "borrower", ...primary }, ...extra];
}

function withDue(deal: Deal, due: string): Deal {
  return { ...deal, nextAction: { ...deal.nextAction, due } };
}

function markDone<T extends { tasks: Deal["tasks"] }>(deal: T, templateIds: string[]): T {
  return {
    ...deal,
    tasks: deal.tasks.map((task) =>
      templateIds.includes(task.templateId)
        ? { ...task, completed: true, completedAt: "2026-07-15T12:00:00.000Z" }
        : task,
    ),
  };
}

function assignOwners<T extends { tasks: Deal["tasks"] }>(
  deal: T,
  owners: Partial<Record<string, PersonId | null>>,
): T {
  return {
    ...deal,
    tasks: deal.tasks.map((task) => ({
      ...task,
      ownerId: owners[task.templateId] ?? task.ownerId,
    })),
  };
}

type IdentityKey = keyof FileIdentity;

type SeedDeal =
  | Omit<ResidentialDeal, "lastTouchedAt" | "firstTouchedAt" | IdentityKey>
  | Omit<CommercialDeal, "lastTouchedAt" | "firstTouchedAt" | IdentityKey>
  | Omit<PrivateDeal, "lastTouchedAt" | "firstTouchedAt" | IdentityKey>;

function finish(deal: SeedDeal, stage: Stage, handoff?: Handoff): Deal {
  const filled = {
    ...alignedFileIdentity("UNSET"),
    ...deal,
    stage,
    lastTouchedAt: "2026-08-10T12:00:00.000Z",
    firstTouchedAt: "2026-07-01T12:00:00.000Z",
  };
  const next = assignNextAction(filled);
  return handoff ? setHandoff(next, handoff) : next;
}

function stampTouch(
  deal: Deal,
  lastTouchedAt: string,
  firstTouchedAt: string | null,
): Deal {
  return { ...deal, lastTouchedAt, firstTouchedAt };
}

function idsBefore(book: Book, stage: Stage): string[] {
  return templatesForBook(book)
    .filter((template) => earliestUnlockIndex(template.unlockStages) < stageIndex(stage))
    .map((template) => template.id);
}

function idsThrough(book: Book, stage: Stage): string[] {
  return templatesForBook(book)
    .filter((template) => earliestUnlockIndex(template.unlockStages) <= stageIndex(stage))
    .map((template) => template.id);
}

export function seedDeals(): Deal[] {
  const alex = finish(
      assignOwners(
        {
          id: "d-alex",
          book: "residential",
          stage: "application",
          parties: people(
            "d-alex",
            {
              name: "Alex Example",
              email: "alex.example@example.test",
              phone: "416-555-0101",
            },
            [
              {
                id: "d-alex-realtor",
                role: "realtor",
                name: "Brookline Referrals",
                email: "brookline.referrals@example.test",
                phone: "416-555-0300",
              },
            ],
          ),
          property: { address: "14 Example Lane, Demo City ON M5V 0A1" },
          lender: "Northpine Bank",
          product: "5-year fixed",
          amount: 612000,
          closeDate: "2026-10-15",
          maturityDate: "2031-10-15",
          conditions: openConditions("d-alex", [
            "Proof of down payment",
            "Employment letter",
          ]),
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
        { "tpl-psa": "p-morgan", "tpl-pay-stubs": "p-riley", "tpl-id-docs": "p-morgan" },
      ),
    "application",
    {
      personId: "p-riley",
      reason: "Assistant to chase T4s and employment letter",
      due: "2026-08-18",
    },
  );

  const jordan = finish(
      markDone(
        assignOwners(
          {
            id: "d-jordan",
            book: "residential",
            stage: "file-complete",
            parties: people("d-jordan", {
              name: "Jordan Demo",
              email: "jordan.demo@example.test",
              phone: "604-555-0144",
            }),
            property: { address: "88 Placeholder Ave, Sampleville BC V6B 1A1" },
            lender: "Harbour Credit Union",
            product: "5-year variable",
            amount: 440000,
            closeDate: "2026-09-28",
            maturityDate: null,
            conditions: openConditions("d-jordan", [
              "Updated mortgage statement",
              "Property insurance binder",
            ]),
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
          { "tpl-fresh-stubs": "p-casey", "tpl-hoi-progress": "p-riley" },
        ),
        idsBefore("residential", "file-complete"),
      ),
    "file-complete",
    {
      personId: "p-casey",
      reason: "Shop UW to chase remaining file-complete items",
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
          parties: people(
            "d-sam",
            {
              name: "Sidney Sample",
              email: "sidney.sample@example.test",
              phone: "905-555-0188",
            },
            [
              {
                id: "d-sam-b2",
                role: "borrower",
                name: "Blair Sampleton",
                email: "blair.sampleton@example.test",
                phone: "905-555-0189",
              },
              {
                id: "d-sam-realtor",
                role: "realtor",
                name: "Marlowe Homes",
                email: "marlowe.homes@example.test",
                phone: "905-555-0200",
              },
              {
                id: "d-sam-lawyer",
                role: "lawyer",
                name: "Ned Notary",
                email: "ned.notary@example.test",
                phone: "905-555-0211",
              },
            ],
          ),
          property: { address: "3 Fiction Court, Mocktown ON L6A 0A1" },
          lender: "Cedar Trust",
          product: "3-year fixed",
          amount: 385000,
          closeDate: "2026-09-10",
          maturityDate: "2026-12-10",
          conditions: openConditions("d-sam", [
            "Remaining income docs",
            "Solicitor contact",
          ]),
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
        { "tpl-outstanding": "p-casey", "tpl-disclosures": "p-riley" },
      ),
      idsBefore("residential", "conditional"),
    ),
    "conditional",
  );

  const parker = finish(
      markDone(
        assignOwners(
          {
            id: "d-quinn",
            book: "residential",
            stage: "lawyer-signing",
            parties: people(
              "d-quinn",
              {
                name: "Parker Placeholder",
                email: "parker.placeholder@example.test",
                phone: "613-555-0162",
              },
            ),
            property: { address: "50 Demo Sideroad, Faketown ON K1A 0A1" },
            lender: "Northpine Bank",
            product: "5-year fixed",
            amount: 528000,
            closeDate: "2026-08-27",
            maturityDate: null,
            conditions: openConditions("d-quinn", ["Insurance binder to lawyer"]),
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
          { "tpl-aml-check": "p-finley", "tpl-hoi-binder": "p-riley" },
        ),
        idsBefore("residential", "lawyer-signing"),
      ),
    "lawyer-signing",
    {
      personId: "p-riley",
      reason: "Confirm HOI binder with loss payee before funds",
      due: "2026-08-20",
    },
  );

  const robin = finish(
    {
      id: "d-robin",
      book: "residential",
      stage: "lead",
      parties: people("d-robin", {
        name: "Robin Fiction",
        email: "robin.fiction@example.test",
        phone: "519-555-0117",
      }),
      property: { address: "9 Sample Crescent, Example Mills ON N2L 0A1" },
      lender: "Not assigned",
      product: "Not selected",
      amount: 475000,
      closeDate: null,
      maturityDate: null,
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

  const kit = finish(
    {
      id: "d-kit",
      book: "residential",
      stage: "lead",
      parties: people("d-kit", {
        name: "Kit Freshfile",
        email: "kit.freshfile@example.test",
        phone: "437-555-0220",
      }),
      property: { address: "2 Newlead Court, Demo City ON M5V 0A2" },
      lender: "Not assigned",
      product: "Not selected",
      amount: 410000,
      closeDate: null,
      maturityDate: null,
      conditions: [],
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
    "lead",
  );

  const devon = finish(
    {
      id: "d-devon",
      book: "residential",
      stage: "discovery",
      parties: people("d-devon", {
        name: "Devon Discovery",
        email: "devon.discovery@example.test",
        phone: "905-555-0244",
      }),
      property: { address: "Not confirmed" },
      lender: "Not assigned",
      product: "Not selected",
      amount: 480000,
      closeDate: null,
      maturityDate: null,
      conditions: [],
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
    "discovery",
  );

  const remy = finish(
    assignOwners(
      {
        id: "d-remy",
        book: "residential",
        stage: "pre-approval",
        parties: people("d-remy", {
          name: "Remy Ratehold",
          email: "remy.ratehold@example.test",
          phone: "416-555-0271",
        }),
        property: { address: null },
        lender: "Northpine Bank",
        product: "Rate hold — not an approval",
        amount: 550000,
        closeDate: null,
        maturityDate: null,
        conditions: [],
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
      { "tpl-id-docs": "p-morgan", "tpl-pay-stubs": "p-riley" },
    ),
    "pre-approval",
  );

  const skyler = finish(
    markDone(
      {
        id: "d-skyler",
        book: "residential",
        stage: "funded",
        parties: people(
          "d-skyler",
          {
            name: "Skyler Placeholder",
            email: "skyler.placeholder@example.test",
            phone: "705-555-0190",
          },
          [
            {
              id: "d-skyler-lawyer",
              role: "lawyer",
              name: "Lee Counsel",
              email: "lee.counsel@example.test",
              phone: "705-555-0191",
            },
          ],
        ),
        property: { address: "21 Mockingbird Way, Testham ON P3A 0A1" },
        lender: "Harbour Credit Union",
        product: "5-year fixed",
        amount: 390000,
        closeDate: "2026-07-30",
        maturityDate: "2031-07-30",
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
        idsThrough("residential", "funded"),
    ),
    "funded",
  );

  const avery = finish(
    assignOwners(
      {
        id: "d-avery",
        book: "commercial",
        stage: "application",
        parties: people(
          "d-avery",
          {
            name: "Avery Showcase",
            email: "avery.showcase@example.test",
            phone: "416-555-0173",
          },
          [
            {
              id: "d-avery-realtor",
              role: "realtor",
              name: "Cedar Street Realty",
              email: "cedar.street@example.test",
              phone: "604-555-0400",
            },
          ],
        ),
        property: { address: "200 Fiction Plaza, Test Harbour ON M5J 0A1" },
        lender: "Summit Commercial",
        product: "5-year commercial term",
        amount: 1850000,
        closeDate: "2026-11-12",
        maturityDate: null,
        conditions: openConditions("d-avery", ["Current rent roll", "Corporate search"]),
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
      { "tpl-rent-roll": "p-morgan", "tpl-noi": "p-morgan", "tpl-dscr": "p-casey", "tpl-id-docs": "p-morgan" },
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
            parties: people("d-cameron", {
              name: "Cameron Testfile",
              email: "cameron.testfile@example.test",
              phone: "403-555-0135",
            }),
            property: { address: "77 Ledger Street, Fakebridge AB T2P 0A1" },
            lender: "Prairie Ledger Bank",
            product: "3-year commercial term",
            amount: 2400000,
            closeDate: "2026-10-02",
            maturityDate: null,
            conditions: openConditions("d-cameron", [
              "Updated rent roll",
              "Environmental questionnaire",
            ]),
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
          { "tpl-registration-instructions": "p-riley", "tpl-environmental": "p-riley" },
        ),
        idsBefore("commercial", "instructions"),
      ),
    "instructions",
    {
      personId: "p-riley",
      reason: "Need the current rent roll from the borrower",
      due: "2026-08-19",
    },
  );

  const drew = finish(
    markDone(
      assignOwners(
        {
          id: "d-drew",
          book: "commercial",
          stage: "review",
          parties: people("d-drew", {
            name: "Drew Mockwell",
            email: "drew.mockwell@example.test",
            phone: "514-555-0128",
          }),
          property: { address: "12 Showcase Blvd, Examplaire QC H3B 0A1" },
          lender: "Summit Commercial",
          product: "5-year commercial term",
          amount: 1600000,
          closeDate: "2026-06-18",
          maturityDate: null,
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
        { "tpl-invoice-match": "p-riley", "tpl-aml-closeout": "p-finley" },
      ),
      idsThrough("commercial", "funded"),
    ),
    "review",
  );

  const harper = finish(
      assignOwners(
        {
          id: "d-harper",
          book: "private",
          stage: "application",
          parties: people("d-harper", {
            name: "Harper Fictional",
            email: "harper.fictional@example.test",
            phone: "647-555-0155",
          }, [
            {
              id: "d-harper-lawyer",
              role: "lawyer",
              name: "Pat Solicitor",
              email: "pat.solicitor@example.test",
              phone: "647-555-0160",
            },
          ]),
          property: { address: "4 Second Position Rd, Demo Heights ON L4B 0A1" },
          lender: "Oakbridge Private",
          product: "12-month private",
          amount: 220000,
          closeDate: "2026-09-04",
          maturityDate: null,
          conditions: openConditions("d-harper", [
            "Signed broker fee agreement",
            "Exit letter",
          ]),
          termMonths: 12,
          exitStrategy: "Refinance to an A lender after 10 months",
          brokerFee: 4800,
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
        { "tpl-term-sheet": "p-morgan", "tpl-exit": "p-morgan", "tpl-private-lawyer": "p-riley", "tpl-id-docs": "p-morgan" },
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
          stage: "lender-uw",
          parties: people("d-reese", {
            name: "Reese Demoaddr",
            email: "reese.demoaddr@example.test",
            phone: "780-555-0199",
          }, [
            {
              id: "d-reese-lawyer",
              role: "lawyer",
              name: "Kim Notary",
              email: "kim.notary@example.test",
              phone: "780-555-0201",
            },
          ]),
          property: { address: "16 Placeholder Trail, Sample Ridge AB T5J 0A1" },
          lender: "Oakbridge Private",
          product: "6-month private",
          amount: 175000,
          closeDate: "2026-08-31",
          maturityDate: null,
          conditions: openConditions("d-reese", [
            "Lawyer confirmation of first-position postponement",
          ]),
          termMonths: 6,
          exitStrategy: "Sale of the property at the end of term",
          brokerFee: 3500,
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
      idsBefore("private", "lender-uw"),
    ),
    "lender-uw",
  );

  const blake = finish(
    {
      id: "d-blake",
      book: "private",
      stage: "fallen-through",
      parties: people("d-blake", {
        name: "Blake Exampleton",
        email: "blake.exampleton@example.test",
        phone: "902-555-0140",
      }),
      property: { address: "1 Fallen Lane, Dummy Port NS B3H 0A1" },
      lender: "Oakbridge Private",
      product: "12-month private",
      amount: 150000,
      closeDate: null,
      maturityDate: null,
      conditions: openConditions("d-blake", ["Borrower withdrew after the term sheet"]),
      termMonths: 12,
      exitStrategy: "Was a refinance; file stopped",
      brokerFee: 3000,
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

  const haven = finish(
    markDone(
      assignOwners(
        {
          id: "d-haven",
          book: "residential",
          stage: "on-hold",
          parties: people("d-haven", {
            name: "Haven Holdfile",
            email: "haven.holdfile@example.test",
            phone: "416-555-0288",
          }),
          property: { address: "6 Pause Court, Holdtown ON M4M 0A1" },
          lender: "Cedar Trust",
          product: "5-year fixed",
          amount: 495000,
          closeDate: "2026-10-08",
          maturityDate: null,
          conditions: openConditions("d-haven", ["Updated pay stubs after parental leave"]),
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
        { "tpl-commitment": "p-morgan", "tpl-outstanding": "p-casey" },
      ),
      idsBefore("residential", "conditional"),
    ),
    "on-hold",
  );

  const idris = finish(
    {
      id: "d-idris",
      book: "residential",
      stage: "inactive",
      parties: people("d-idris", {
        name: "Idris Coldfile",
        email: "idris.coldfile@example.test",
        phone: "519-555-0290",
      }),
      property: { address: "18 Shelf Street, Coldton ON N6A 0A1" },
      lender: "Not assigned",
      product: "Not selected",
      amount: 320000,
      closeDate: "2026-09-01",
      maturityDate: null,
      conditions: [],
      purpose: "refinance",
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
    "inactive",
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

  const stamped = [
    stampTouch(withDue(withNotes[0] ?? alex, "2026-08-20"), "2026-08-13T12:00:00.000Z", "2026-08-01T12:00:00.000Z"),
    stampTouch(withNotes[1] ?? jordan, "2026-07-01T12:00:00.000Z", "2026-06-01T12:00:00.000Z"),
    stampTouch(withDue(sidney, "2026-08-25"), "2026-08-12T12:00:00.000Z", "2026-07-20T12:00:00.000Z"),
    stampTouch(parker, "2026-08-11T12:00:00.000Z", "2026-07-15T12:00:00.000Z"),
    stampTouch(robin, "2026-08-14T09:00:00.000Z", null),
    stampTouch(kit, "2026-08-14T08:00:00.000Z", null),
    stampTouch(devon, "2026-08-13T16:00:00.000Z", "2026-08-13T16:00:00.000Z"),
    stampTouch(remy, "2026-08-12T11:00:00.000Z", "2026-08-05T12:00:00.000Z"),
    stampTouch(skyler, "2026-01-20T12:00:00.000Z", "2025-11-01T12:00:00.000Z"),
    stampTouch(withNotes[2] ?? avery, "2026-08-11T12:00:00.000Z", "2026-07-18T12:00:00.000Z"),
    stampTouch(cameron, "2026-08-09T12:00:00.000Z", "2026-07-10T12:00:00.000Z"),
    stampTouch(drew, "2026-06-18T12:00:00.000Z", "2026-03-01T12:00:00.000Z"),
    stampTouch(withNotes[3] ?? harper, "2026-08-14T09:20:00.000Z", "2026-08-01T12:00:00.000Z"),
    stampTouch(reese, "2026-08-08T12:00:00.000Z", "2026-07-22T12:00:00.000Z"),
    stampTouch(blake, "2026-07-20T12:00:00.000Z", "2026-06-15T12:00:00.000Z"),
    stampTouch(haven, "2026-08-10T12:00:00.000Z", "2026-07-12T12:00:00.000Z"),
    stampTouch(idris, "2026-06-01T12:00:00.000Z", "2026-05-01T12:00:00.000Z"),
  ];

  return stamped.map((deal) => ({ ...deal, ...fileIdentityFor(deal.id) }));
}

const FILE_IDENTITIES: Record<string, FileIdentity> = {
  "d-alex": alignedFileIdentity("FF-001", {
    payoutAmount: 7344,
    payoutTrackingStatus: "Pending",
    payoutTrackingDate: "2026-08-10",
  }),
  "d-jordan": alignedFileIdentity("FF-002", {
    mosFileId: "MOS-77881",
    fileKey: "MOS-77881",
    spreadsheetDealKey: "SS-77881",
    payoutAmount: 5280,
    payoutTrackingStatus: "Pending",
    payoutTrackingDate: "2026-08-05",
  }),
  "d-sam": alignedFileIdentity("FF-003", {
    payoutAmount: 4620,
    payoutTrackingStatus: "Posted",
    payoutTrackingDate: "2026-08-01",
    mosCloseDate: "2026-07-15",
    mosDocumentFlags: "Commitment on file",
  }),
  "d-quinn": alignedFileIdentity("FF-004", {
    payoutAmount: 6336,
    payoutTrackingStatus: "Pending",
    payoutTrackingDate: "2026-08-12",
    mosCloseDate: "2026-08-01",
    mosDocumentFlags: "Close date on MOS",
  }),
  "d-robin": alignedFileIdentity("FF-005"),
  "d-kit": alignedFileIdentity("FF-006"),
  "d-devon": alignedFileIdentity("FF-014"),
  "d-remy": alignedFileIdentity("FF-015", {
    payoutAmount: 0,
    payoutTrackingStatus: "Not tracked",
    payoutTrackingDate: null,
  }),
  "d-skyler": alignedFileIdentity("FF-007", {
    fundedAt: "2026-02-10",
    fundingConfirmRef: "FC-SKYLER-2026-02",
    payoutAmount: 4680,
    payoutTrackingStatus: "Posted",
    payoutTrackingDate: "2026-02-12",
  }),
  "d-avery": alignedFileIdentity("FF-008", {
    payoutAmount: 22200,
    payoutTrackingStatus: "Pending",
    payoutTrackingDate: "2026-08-11",
  }),
  "d-cameron": alignedFileIdentity("FF-009", {
    payoutAmount: 28800,
    payoutTrackingStatus: "Pending",
    payoutTrackingDate: "2026-08-09",
  }),
  "d-drew": alignedFileIdentity("FF-010", {
    fundedAt: "2026-06-18",
    fundingConfirmRef: "FC-DREW-2026-06",
    payoutAmount: 19200,
    payoutTrackingStatus: "Posted",
    payoutTrackingDate: "2026-06-20",
  }),
  "d-harper": alignedFileIdentity("FF-011", {
    payoutAmount: 4800,
    payoutTrackingStatus: "Pending",
    payoutTrackingDate: "2026-08-14",
  }),
  "d-reese": alignedFileIdentity("FF-012", {
    payoutAmount: 3500,
    payoutTrackingStatus: "Pending",
    payoutTrackingDate: "2026-08-08",
  }),
  "d-blake": alignedFileIdentity("FF-013"),
  "d-haven": alignedFileIdentity("FF-016", {
    payoutAmount: 5940,
    payoutTrackingStatus: "Not tracked",
    payoutTrackingDate: null,
  }),
  "d-idris": alignedFileIdentity("FF-017"),
};

function fileIdentityFor(dealId: string): FileIdentity {
  return FILE_IDENTITIES[dealId] ?? alignedFileIdentity(dealId);
}

export function seedInvoices(): Invoice[] {
  return [
    {
      id: "inv-alex-file",
      operationalFileNumber: "FF-001",
      mosFileId: "FF-001",
      fileKey: "FF-001",
      spreadsheetDealKey: "FF-001",
      borrowerName: "Alex Example",
      lender: "Northpine Bank",
      payoutAmount: 7344,
      incomeTrackingStatus: "Pending",
      incomeTrackingDate: "2026-08-10",
    },
    {
      id: "inv-sidney-hit",
      operationalFileNumber: null,
      mosFileId: null,
      fileKey: "FF-003",
      spreadsheetDealKey: "SS-SIDNEY",
      borrowerName: "Sidney Sample",
      lender: "Cedar Trust",
      payoutAmount: 4620,
      incomeTrackingStatus: "Posted",
      incomeTrackingDate: "2026-08-01",
    },
    {
      id: "inv-name-miss",
      operationalFileNumber: null,
      mosFileId: null,
      fileKey: null,
      spreadsheetDealKey: "SS-SIDNEY",
      borrowerName: "Sidney Sample",
      lender: "Cedar Trust",
      payoutAmount: 4620,
      incomeTrackingStatus: "Posted",
      incomeTrackingDate: "2026-08-01",
    },
    {
      id: "inv-jordan-mos",
      operationalFileNumber: null,
      mosFileId: "MOS-77881",
      fileKey: "MOS-77881",
      spreadsheetDealKey: "SS-77881",
      borrowerName: "Jordan Demo",
      lender: "Harbour Credit Union",
      payoutAmount: 5280,
      incomeTrackingStatus: "Pending",
      incomeTrackingDate: "2026-08-05",
    },
  ];
}
