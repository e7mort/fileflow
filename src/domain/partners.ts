import type { Deal, Partner, PartnerPulse, Stage } from "../types";
import { STAGE_LABELS } from "./stages";
import { primaryBorrower } from "./parties";

export const PARTNERS: Partner[] = [
  {
    id: "pt-marlowe",
    name: "Marlowe Homes",
    email: "marlowe.homes@example.test",
    phone: "905-555-0200",
  },
  {
    id: "pt-brookline",
    name: "Brookline Referrals",
    email: "brookline.referrals@example.test",
    phone: "416-555-0300",
  },
  {
    id: "pt-cedar",
    name: "Cedar Street Realty",
    email: "cedar.street@example.test",
    phone: "604-555-0400",
  },
];

export function partnerByName(name: string): Partner | undefined {
  return PARTNERS.find((partner) => partner.name.toLowerCase() === name.trim().toLowerCase());
}

export function realtorPartner(deal: Deal): Partner | undefined {
  const realtor = deal.parties.find((party) => party.role === "realtor");
  if (!realtor) {
    return undefined;
  }
  return partnerByName(realtor.name);
}

export function pulseForStageMove(
  deal: Deal,
  from: Stage,
  to: Stage,
  createdAt: string,
): PartnerPulse | null {
  const partner = realtorPartner(deal);
  if (!partner || from === to) {
    return null;
  }
  return {
    id: `pulse-${deal.id}-${to}-${createdAt}`,
    partnerId: partner.id,
    dealId: deal.id,
    body: `${primaryBorrower(deal).name} moved to ${STAGE_LABELS[to]}`,
    createdAt,
  };
}

export function pulsesForPartner(
  pulses: PartnerPulse[],
  partnerId: string,
): PartnerPulse[] {
  return pulses
    .filter((pulse) => pulse.partnerId === partnerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function seedPulses(): PartnerPulse[] {
  return [
    {
      id: "pulse-sidney-seed",
      partnerId: "pt-marlowe",
      dealId: "d-sam",
      body: "Sidney Sample is in Conditional",
      createdAt: "2026-08-10T15:00:00.000Z",
    },
  ];
}
