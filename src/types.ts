export const STAGES = [
  "lead",
  "application",
  "submitted",
  "conditional",
  "clear-to-close",
  "funded",
  "fallen-through",
] as const;

export type Stage = (typeof STAGES)[number];

export const BOOKS = ["residential", "commercial", "private"] as const;
export type Book = (typeof BOOKS)[number];

export const ROLES = ["broker", "processor", "underwriter", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const RESIDENTIAL_PURPOSES = [
  "purchase",
  "refinance",
  "renewal",
  "switch",
] as const;
export type ResidentialPurpose = (typeof RESIDENTIAL_PURPOSES)[number];

export type InsuranceStatus = "insured" | "uninsured";
export type ChargePosition = "first" | "second";

export type StressTest =
  | { kind: "value"; qualifyingRate: number }
  | { kind: "status"; status: "pending" | "passed" | "failed" };

export type PersonId = string;
export type DealId = string;
export type TaskId = string;
export type MentionId = string;
export type TemplateId = string;
export type PartyId = string;
export type ConditionId = string;
export type ConversationId = string;
export type MessageId = string;
export type ConsultId = string;
export type ConsultSlotId = string;

export const LEAD_SOURCES = ["ads", "whatsapp", "web", "realtor", "book"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const CHANNELS = ["sms", "whatsapp", "web"] as const;
export type Channel = (typeof CHANNELS)[number];

export const BOT_STEPS = [
  "purpose",
  "city",
  "amount",
  "timing",
  "slot",
  "handed-off",
] as const;
export type BotStep = (typeof BOT_STEPS)[number];

export type ChatRole = "lead" | "bot" | "desk";

export type ChatMessage = {
  id: MessageId;
  at: string;
  from: ChatRole;
  body: string;
};

export type Conversation = {
  id: ConversationId;
  channel: Channel;
  contactName: string;
  phone: string;
  step: BotStep;
  purpose: ResidentialPurpose | null;
  city: string | null;
  amount: number | null;
  timing: string | null;
  slotId: ConsultSlotId | null;
  dealId: DealId | null;
  unread: boolean;
  messages: ChatMessage[];
  updatedAt: string;
};

export type Consult = {
  id: ConsultId;
  conversationId: ConversationId;
  dealId: DealId;
  slotId: ConsultSlotId;
  startsAt: string;
  status: "booked" | "confirmed";
};

export type Person = {
  id: PersonId;
  name: string;
  role: Role;
};

export type Handoff = {
  personId: PersonId;
  reason: string;
  due: string | null;
};

export type NextAction = {
  taskId: TaskId | null;
  title: string;
  ownerId: PersonId | null;
  due: string | null;
  waitingOn: Handoff | null;
};

export type Task = {
  id: TaskId;
  templateId: TemplateId;
  title: string;
  unlockStages: Stage[];
  ownerId: PersonId | null;
  due: string | null;
  completed: boolean;
  completedAt: string | null;
};

export type Mention = {
  id: MentionId;
  authorId: PersonId;
  body: string;
  mentionedPersonIds: PersonId[];
  createdAt: string;
};

export const PARTY_ROLES = ["borrower", "realtor", "lawyer"] as const;
export type PartyRole = (typeof PARTY_ROLES)[number];

export type FileParty = {
  id: PartyId;
  name: string;
  email: string;
  phone: string;
  role: PartyRole;
};

export type Condition = {
  id: ConditionId;
  title: string;
  completed: boolean;
  completedAt: string | null;
};

export type Property = {
  address: string;
};

type DealBase = {
  id: DealId;
  stage: Stage;
  source?: LeadSource;
  parties: FileParty[];
  property: Property;
  lender: string;
  product: string;
  amount: number;
  closeDate: string | null;
  maturityDate: string | null;
  conditions: Condition[];
  nextAction: NextAction;
  tasks: Task[];
  mentions: Mention[];
  lastTouchedAt: string;
  firstTouchedAt: string | null;
};

export type PartnerId = string;

export type Partner = {
  id: PartnerId;
  name: string;
  email: string;
  phone: string;
};

export type PartnerPulse = {
  id: string;
  partnerId: PartnerId;
  dealId: DealId;
  body: string;
  createdAt: string;
};

export type ResidentialDeal = DealBase & {
  book: "residential";
  purpose: ResidentialPurpose;
  insurance: InsuranceStatus;
  stressTest: StressTest;
};

export type CommercialDeal = DealBase & {
  book: "commercial";
  dscr: number | null;
  noi: number | null;
};

export type PrivateDeal = DealBase & {
  book: "private";
  termMonths: number;
  exitStrategy: string;
  brokerFee: number | null;
  position: ChargePosition;
};

export type Deal = ResidentialDeal | CommercialDeal | PrivateDeal;

export type TaskTemplate = {
  id: TemplateId;
  title: string;
  books: Book[];
  unlockStages: Stage[];
  order: number;
};
