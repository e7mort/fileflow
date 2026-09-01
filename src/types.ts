export const STAGES = [
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
] as const;

export type Stage = (typeof STAGES)[number];

export const BOOKS = ["residential", "commercial", "private"] as const;
export type Book = (typeof BOOKS)[number];

export const ROLES = ["lo", "processor", "uw", "compliance", "marketing"] as const;
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

export type TaskKind = "standard" | "compliance";

export type Task = {
  id: TaskId;
  templateId: TemplateId;
  title: string;
  unlockStages: Stage[];
  ownerId: PersonId | null;
  due: string | null;
  completed: boolean;
  completedAt: string | null;
  kind: TaskKind;
  packLabel: string;
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
  address: string | null;
};

export type FileIdentity = {
  fileNumber: string;
  mosFileId: string;
  fileKey: string;
  spreadsheetDealKey: string;
  fundedAt: string | null;
  mosCloseDate: string | null;
  mosDocumentFlags: string | null;
  payoutAmount: number;
  payoutTrackingStatus: string;
  payoutTrackingDate: string | null;
};

export type Invoice = {
  id: string;
  operationalFileNumber: string | null;
  mosFileId: string | null;
  fileKey: string | null;
  spreadsheetDealKey: string | null;
  borrowerName: string | null;
  lender: string;
  payoutAmount: number;
  incomeTrackingStatus: string;
  incomeTrackingDate: string | null;
};

export function alignedFileIdentity(
  fileNumber: string,
  extra: Partial<FileIdentity> = {},
): FileIdentity {
  return {
    fileNumber,
    mosFileId: extra.mosFileId ?? fileNumber,
    fileKey: extra.fileKey ?? extra.mosFileId ?? fileNumber,
    spreadsheetDealKey: extra.spreadsheetDealKey ?? fileNumber,
    fundedAt: extra.fundedAt ?? null,
    mosCloseDate: extra.mosCloseDate ?? null,
    mosDocumentFlags: extra.mosDocumentFlags ?? null,
    payoutAmount: extra.payoutAmount ?? 0,
    payoutTrackingStatus: extra.payoutTrackingStatus ?? "Not tracked",
    payoutTrackingDate: extra.payoutTrackingDate ?? null,
  };
}

type DealBase = FileIdentity & {
  id: DealId;
  stage: Stage;
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
  kind: TaskKind;
  packLabel: string;
};
