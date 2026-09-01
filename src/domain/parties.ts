import type { Deal, FileParty, PartyRole } from "../types";

export function primaryBorrower(deal: Deal): FileParty {
  const borrower = deal.parties.find((party) => party.role === "borrower");
  if (!borrower) {
    throw new Error(`File ${deal.id} has no borrower`);
  }
  return borrower;
}

export function partyRoleLabel(role: PartyRole): string {
  switch (role) {
    case "borrower":
      return "Borrower";
    case "realtor":
      return "Realtor";
    case "lawyer":
      return "Lawyer / notary";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function findAssignedParty(
  deal: Deal,
  input: { name: string; email: string },
): FileParty | undefined {
  const name = normalize(input.name);
  const email = normalize(input.email);
  return deal.parties.find((party) => {
    if (name && normalize(party.name) === name) {
      return true;
    }
    return Boolean(email) && normalize(party.email) === email;
  });
}

export type AddPartyResult =
  | { ok: true; deal: Deal }
  | { ok: false; error: "already-assigned"; existing: FileParty }
  | { ok: false; error: "empty-name" };

export function addParty(
  deal: Deal,
  input: { name: string; email: string; phone: string; role: PartyRole },
): AddPartyResult {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "empty-name" };
  }
  const existing = findAssignedParty(deal, { name, email: input.email });
  if (existing) {
    return { ok: false, error: "already-assigned", existing };
  }
  const party: FileParty = {
    id: `party-${deal.id}-${deal.parties.length + 1}`,
    name,
    email: input.email.trim(),
    phone: input.phone.trim(),
    role: input.role,
  };
  return { ok: true, deal: { ...deal, parties: [...deal.parties, party] } };
}
