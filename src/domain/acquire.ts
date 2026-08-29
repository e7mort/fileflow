import type {
  BotStep,
  Channel,
  ChatMessage,
  Consult,
  ConsultSlotId,
  Conversation,
  ConversationId,
  Deal,
  ResidentialDeal,
  ResidentialPurpose,
} from "../types";
import { DEMO_TODAY } from "./maturity";
import { assignNextAction, instantiateTasks, setHandoff } from "./engine";
import { isTerminalStage } from "./stages";

export type ConsultSlot = {
  id: ConsultSlotId;
  startsAt: string;
  date: string;
  label: string;
};

export const CONSULT_SLOTS: ConsultSlot[] = [
  { id: "s-0815-10", startsAt: "2026-08-15T10:00:00.000Z", date: "2026-08-15", label: "Fri 15 Aug · 10:00" },
  { id: "s-0818-14", startsAt: "2026-08-18T14:00:00.000Z", date: "2026-08-18", label: "Mon 18 Aug · 14:00" },
  { id: "s-0819-16", startsAt: "2026-08-19T16:00:00.000Z", date: "2026-08-19", label: "Tue 19 Aug · 16:00" },
  { id: "s-0820-10", startsAt: "2026-08-20T10:00:00.000Z", date: "2026-08-20", label: "Wed 20 Aug · 10:00" },
];

export type PipelineKpis = {
  openPipeline: number;
  fundedThisMonth: number;
  consultsThisMonth: number;
  allTimeFunded: number;
};

export function isOpenStage(deal: Deal): boolean {
  return !isTerminalStage(deal.stage);
}

export function inDemoMonth(isoDate: string | null, today = DEMO_TODAY): boolean {
  if (!isoDate) {
    return false;
  }
  const stamp = isoDate.slice(0, 7);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return stamp === `${year}-${month}`;
}

export function pipelineKpis(deals: Deal[], consults: Consult[], today = DEMO_TODAY): PipelineKpis {
  return {
    openPipeline: deals.filter(isOpenStage).reduce((sum, deal) => sum + deal.amount, 0),
    fundedThisMonth: deals
      .filter((deal) => deal.stage === "funded" && inDemoMonth(deal.closeDate, today))
      .reduce((sum, deal) => sum + deal.amount, 0),
    consultsThisMonth: consults.filter((consult) => inDemoMonth(consult.startsAt, today)).length,
    allTimeFunded: deals
      .filter((deal) => deal.stage === "funded")
      .reduce((sum, deal) => sum + deal.amount, 0),
  };
}

export function columnValue(deals: Deal[]): number {
  return deals.reduce((sum, deal) => sum + deal.amount, 0);
}

export function parsePurpose(text: string): ResidentialPurpose | null {
  const lower = text.toLowerCase();
  if (/\b(renewal|renew|maturity)\b/.test(lower)) {
    return "renewal";
  }
  if (/\b(refi|refinance|equity)\b/.test(lower)) {
    return "refinance";
  }
  if (/\b(switch|transfer)\b/.test(lower)) {
    return "switch";
  }
  if (/\b(purchase|buy|buying|first[- ]?time)\b/.test(lower)) {
    return "purchase";
  }
  return null;
}

export function parseAmount(text: string): number | null {
  const cleaned = text.toLowerCase().replace(/[,$\s]/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)(k|m)?/);
  if (!match?.[1]) {
    return null;
  }
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  if (match[2] === "m") {
    return Math.round(value * 1_000_000);
  }
  if (match[2] === "k") {
    return Math.round(value * 1_000);
  }
  if (value < 1000) {
    return null;
  }
  return Math.round(value);
}

export function parseTiming(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\b(this month|asap|soon|now)\b/.test(lower)) {
    return "this month";
  }
  if (/\b(1-3|1 to 3|few months|couple)\b/.test(lower)) {
    return "1–3 months";
  }
  if (/\b(later|next year|4|six|6)\b/.test(lower)) {
    return "later";
  }
  if (lower.trim().length > 1) {
    return text.trim();
  }
  return null;
}

export function parseSlotChoice(
  text: string,
  available: ConsultSlot[],
): ConsultSlot | null {
  const trimmed = text.trim().toLowerCase();
  const numbered = trimmed.match(/^([1-4])\b/);
  if (numbered?.[1]) {
    const index = Number(numbered[1]) - 1;
    return available[index] ?? null;
  }
  return (
    available.find(
      (slot) =>
        trimmed.includes(slot.id) ||
        trimmed.includes(slot.date) ||
        trimmed.includes(slot.label.toLowerCase().slice(0, 10)),
    ) ?? null
  );
}

export function availableSlots(consults: Consult[]): ConsultSlot[] {
  const taken = new Set(consults.map((consult) => consult.slotId));
  return CONSULT_SLOTS.filter((slot) => !taken.has(slot.id));
}

function slotMenu(slots: ConsultSlot[]): string {
  if (slots.length === 0) {
    return "No open consult slots left in the demo week. Reset demo to free the calendar.";
  }
  const lines = slots
    .slice(0, 3)
    .map((slot, index) => `${index + 1}) ${slot.label}`);
  return `Pick a 20-minute consult. Reply with 1, 2, or 3.\n${lines.join("\n")}`;
}

function message(
  id: string,
  at: string,
  from: ChatMessage["from"],
  body: string,
): ChatMessage {
  return { id, at, from, body };
}

export function openingBotLine(name: string, purpose: ResidentialPurpose | null): string {
  const first = name.split(" ")[0] ?? "there";
  if (purpose) {
    return `Hi ${first}. This is the Fileflow desk — a person still takes the file. Which city is the property in?`;
  }
  return `Hi ${first}. This is the Fileflow desk — a person still takes the file. Purchase, renewal, or refinance?`;
}

export function startConversation(input: {
  id: ConversationId;
  channel: Channel;
  name: string;
  phone: string;
  purpose?: ResidentialPurpose | null;
  firstLeadLine?: string;
  now: string;
}): Conversation {
  const purpose = input.purpose ?? null;
  const step: BotStep = purpose ? "city" : "purpose";
  const messages: ChatMessage[] = [];
  if (input.firstLeadLine) {
    messages.push(message(`${input.id}-m0`, input.now, "lead", input.firstLeadLine));
  }
  messages.push(
    message(`${input.id}-m1`, input.now, "bot", openingBotLine(input.name, purpose)),
  );
  return {
    id: input.id,
    channel: input.channel,
    contactName: input.name,
    phone: input.phone,
    step,
    purpose,
    city: null,
    amount: null,
    timing: null,
    slotId: null,
    dealId: null,
    unread: true,
    messages,
    updatedAt: input.now,
  };
}

export function buildIntakeLead(input: {
  id: string;
  name: string;
  phone: string;
  purpose: ResidentialPurpose;
  city: string;
  amount: number;
  slot: ConsultSlot;
  now: string;
  source: Conversation["channel"];
}): ResidentialDeal {
  const leadSource =
    input.source === "web" ? "web" : input.source === "sms" ? "whatsapp" : "whatsapp";
  const base: ResidentialDeal = {
    id: input.id,
    book: "residential",
    stage: "lead",
    source: leadSource,
    parties: [
      {
        id: `${input.id}-b1`,
        role: "borrower",
        name: input.name,
        email: `${input.id}@example.test`,
        phone: input.phone,
      },
    ],
    property: { address: `${input.city} (city only — no street yet)` },
    lender: "Unassigned",
    product: "Unquoted",
    amount: input.amount,
    closeDate: null,
    maturityDate: null,
    conditions: [],
    purpose: input.purpose,
    insurance: "uninsured",
    stressTest: { kind: "status", status: "pending" },
    nextAction: {
      taskId: null,
      title: "",
      ownerId: null,
      due: null,
      waitingOn: null,
    },
    tasks: instantiateTasks({ book: "residential", idPrefix: input.id }),
    mentions: [],
    lastTouchedAt: input.now,
    firstTouchedAt: input.now,
  };
  const assigned = assignNextAction(base);
  const handed = setHandoff(assigned, {
    personId: "p-riley",
    reason: `Confirm the ${input.slot.label} consult`,
    due: input.slot.date,
  });
  return {
    ...base,
    nextAction: {
      ...handed.nextAction,
      title: `Reception: confirm consult with ${input.name}`,
      ownerId: "p-riley",
      due: input.slot.date,
    },
  };
}

export type BotTurn = {
  conversation: Conversation;
  deal?: ResidentialDeal;
  consult?: Consult;
};

function appendBot(conversation: Conversation, now: string, body: string): Conversation {
  return {
    ...conversation,
    updatedAt: now,
    unread: true,
    messages: [
      ...conversation.messages,
      message(`${conversation.id}-b${conversation.messages.length}`, now, "bot", body),
    ],
  };
}

function withLeadMessage(conversation: Conversation, now: string, text: string): Conversation {
  return {
    ...conversation,
    updatedAt: now,
    messages: [
      ...conversation.messages,
      message(`${conversation.id}-l${conversation.messages.length}`, now, "lead", text),
    ],
  };
}

export function replyToLead(
  conversation: Conversation,
  text: string,
  consults: Consult[],
  now: string,
): BotTurn {
  const spoken = withLeadMessage(conversation, now, text);
  if (spoken.step === "handed-off") {
    return {
      conversation: appendBot(
        spoken,
        now,
        "This thread already booked a consult. Open the file from the pipeline — Riley on the desk has the next action.",
      ),
    };
  }

  if (spoken.step === "purpose") {
    const purpose = parsePurpose(text);
    if (!purpose) {
      return {
        conversation: appendBot(
          spoken,
          now,
          "Purchase, renewal, or refinance — one of those three is enough.",
        ),
      };
    }
    return {
      conversation: appendBot(
        { ...spoken, purpose, step: "city" },
        now,
        "Which city is the property in?",
      ),
    };
  }

  if (spoken.step === "city") {
    const city = text.trim();
    if (city.length < 2) {
      return {
        conversation: appendBot(spoken, now, "Need a city so the desk knows which book to open."),
      };
    }
    return {
      conversation: appendBot(
        { ...spoken, city, step: "amount" },
        now,
        "Rough mortgage amount? A number is enough — 680000 or 680k.",
      ),
    };
  }

  if (spoken.step === "amount") {
    const amount = parseAmount(text);
    if (!amount) {
      return {
        conversation: appendBot(
          spoken,
          now,
          "Need a number over $1,000. 680k or 680000 both work.",
        ),
      };
    }
    return {
      conversation: appendBot(
        { ...spoken, amount, step: "timing" },
        now,
        "When do you need this done? This month, 1–3 months, or later.",
      ),
    };
  }

  if (spoken.step === "timing") {
    const timing = parseTiming(text);
    if (!timing) {
      return {
        conversation: appendBot(spoken, now, "This month, 1–3 months, or later."),
      };
    }
    const open = availableSlots(consults);
    return {
      conversation: appendBot({ ...spoken, timing, step: "slot" }, now, slotMenu(open)),
    };
  }

  const open = availableSlots(consults);
  const slot = parseSlotChoice(text, open.slice(0, 3));
  if (!slot) {
    return {
      conversation: appendBot(spoken, now, slotMenu(open)),
    };
  }
  if (!spoken.purpose || !spoken.city || !spoken.amount) {
    return {
      conversation: appendBot(spoken, now, "Thread is missing a fact. Reset demo and try again."),
    };
  }

  const deal = buildIntakeLead({
    id: `d-in-${spoken.id}`,
    name: spoken.contactName,
    phone: spoken.phone,
    purpose: spoken.purpose,
    city: spoken.city,
    amount: spoken.amount,
    slot,
    now,
    source: spoken.channel,
  });
  const consult: Consult = {
    id: `consult-${spoken.id}`,
    conversationId: spoken.id,
    dealId: deal.id,
    slotId: slot.id,
    startsAt: slot.startsAt,
    status: "booked",
  };
  const closed: Conversation = {
    ...spoken,
    step: "handed-off",
    slotId: slot.id,
    dealId: deal.id,
    unread: false,
    updatedAt: now,
  };
  return {
    conversation: appendBot(
      closed,
      now,
      `Booked ${slot.label}. Riley on the desk will confirm. The file is in Lead with one next action. Nothing is emailed or texted for real — this is the demo.`,
    ),
    deal,
    consult,
  };
}

function seededMessage(
  id: string,
  at: string,
  from: ChatMessage["from"],
  body: string,
): ChatMessage {
  return { id, at, from, body };
}

export function seedConversations(): Conversation[] {
  const pat: Conversation = {
    id: "c-pat",
    channel: "whatsapp",
    contactName: "Pat Inbound",
    phone: "604-555-0188",
    step: "handed-off",
    purpose: "renewal",
    city: "Richmond",
    amount: 680000,
    timing: "this month",
    slotId: "s-0815-10",
    dealId: "d-pat",
    unread: false,
    updatedAt: "2026-08-14T09:12:00.000Z",
    messages: [
      seededMessage("c-pat-0", "2026-08-14T09:00:00.000Z", "lead", "Hi — bank wants me to auto-renew. Can you look at it?"),
      seededMessage("c-pat-1", "2026-08-14T09:00:05.000Z", "bot", openingBotLine("Pat Inbound", "renewal")),
      seededMessage("c-pat-2", "2026-08-14T09:04:00.000Z", "lead", "Richmond"),
      seededMessage("c-pat-3", "2026-08-14T09:04:05.000Z", "bot", "Rough mortgage amount? A number is enough — 680000 or 680k."),
      seededMessage("c-pat-4", "2026-08-14T09:06:00.000Z", "lead", "680k"),
      seededMessage("c-pat-5", "2026-08-14T09:06:05.000Z", "bot", "When do you need this done? This month, 1–3 months, or later."),
      seededMessage("c-pat-6", "2026-08-14T09:08:00.000Z", "lead", "this month"),
      seededMessage("c-pat-7", "2026-08-14T09:08:05.000Z", "bot", "Pick a 20-minute consult. Reply with 1, 2, or 3.\n1) Fri 15 Aug · 10:00\n2) Mon 18 Aug · 14:00\n3) Tue 19 Aug · 16:00"),
      seededMessage("c-pat-8", "2026-08-14T09:12:00.000Z", "lead", "1"),
      seededMessage("c-pat-9", "2026-08-14T09:12:05.000Z", "bot", "Booked Fri 15 Aug · 10:00. Riley on the desk will confirm. The file is in Lead with one next action. Nothing is emailed or texted for real — this is the demo."),
    ],
  };

  const nico = startConversation({
    id: "c-nico",
    channel: "sms",
    name: "Nico Ads",
    phone: "778-555-0144",
    firstLeadLine: "Saw the renewal ad. Don't want to roll with the bank.",
    now: "2026-08-14T10:20:00.000Z",
  });
  const nicoPurpose = replyToLead(nico, "renewal", [], "2026-08-14T10:21:00.000Z");

  return [pat, nicoPurpose.conversation];
}

export function seedConsults(): Consult[] {
  return [
    {
      id: "consult-c-pat",
      conversationId: "c-pat",
      dealId: "d-pat",
      slotId: "s-0815-10",
      startsAt: "2026-08-15T10:00:00.000Z",
      status: "booked",
    },
  ];
}

export function seedPatDeal(): ResidentialDeal {
  const slot = CONSULT_SLOTS[0];
  if (!slot) {
    throw new Error("consult slots missing");
  }
  return buildIntakeLead({
    id: "d-pat",
    name: "Pat Inbound",
    phone: "604-555-0188",
    purpose: "renewal",
    city: "Richmond",
    amount: 680000,
    slot,
    now: "2026-08-14T09:12:00.000Z",
    source: "whatsapp",
  });
}
