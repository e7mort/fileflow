import type { Deal, DealId, Invoice } from "../types";

export const JOIN_RULES = [
  "Match invoices to a file by operational File # first.",
  "Else match MOS file id or FILEKEY.",
  "Never match on client/borrower name.",
  "Never trust a parallel spreadsheet deal key alone.",
  "If operational File # and MOS file id/FILEKEY disagree, mark the file CONFLICTING and display both ids.",
] as const;

export type InvoiceBindVia = "operational-file-number" | "mos-file-id" | "filekey";

export type UnmatchedIgnored = "borrower-name" | "spreadsheet-deal-key" | "none";

export type InvoiceBind =
  | {
      status: "bound";
      dealId: DealId;
      via: InvoiceBindVia;
      identityMatch: boolean;
    }
  | {
      status: "unmatched";
      ignored: UnmatchedIgnored;
    };

export type BoundInvoice = {
  invoice: Invoice;
  via: InvoiceBindVia;
  identityMatch: boolean;
};

export function isConflicting(deal: Deal): boolean {
  return deal.fileNumber !== deal.mosFileId || deal.fileNumber !== deal.fileKey;
}

export function hasFundingConfirm(deal: Pick<Deal, "fundedAt" | "fundingConfirmRef">): boolean {
  return Boolean(deal.fundedAt) || Boolean(deal.fundingConfirmRef?.trim());
}

export function isFundedInFileflow(deal: Deal): boolean {
  return hasFundingConfirm(deal);
}

export function identityMatches(invoice: Invoice, deal: Deal): boolean {
  if (!invoice.fileKey) {
    return false;
  }
  return (
    invoice.fileKey === deal.fileKey &&
    invoice.lender === deal.lender &&
    invoice.payoutAmount === deal.payoutAmount &&
    invoice.incomeTrackingStatus === deal.payoutTrackingStatus &&
    invoice.incomeTrackingDate === deal.payoutTrackingDate
  );
}

function unmatchedReason(invoice: Invoice): InvoiceBind {
  if (invoice.operationalFileNumber || invoice.mosFileId || invoice.fileKey) {
    return { status: "unmatched", ignored: "none" };
  }
  if (invoice.borrowerName) {
    return { status: "unmatched", ignored: "borrower-name" };
  }
  if (invoice.spreadsheetDealKey) {
    return { status: "unmatched", ignored: "spreadsheet-deal-key" };
  }
  return { status: "unmatched", ignored: "none" };
}

export function bindInvoice(invoice: Invoice, deals: Deal[]): InvoiceBind {
  if (invoice.operationalFileNumber) {
    const deal = deals.find((item) => item.fileNumber === invoice.operationalFileNumber);
    if (!deal) {
      return unmatchedReason(invoice);
    }
    return {
      status: "bound",
      dealId: deal.id,
      via: "operational-file-number",
      identityMatch: identityMatches(invoice, deal),
    };
  }

  if (invoice.mosFileId) {
    const deal = deals.find((item) => item.mosFileId === invoice.mosFileId);
    if (deal) {
      return {
        status: "bound",
        dealId: deal.id,
        via: "mos-file-id",
        identityMatch: identityMatches(invoice, deal),
      };
    }
  }

  if (invoice.fileKey) {
    const deal = deals.find((item) => item.fileKey === invoice.fileKey);
    if (deal) {
      return {
        status: "bound",
        dealId: deal.id,
        via: "filekey",
        identityMatch: identityMatches(invoice, deal),
      };
    }
  }

  return unmatchedReason(invoice);
}

export function unmatchedInvoices(invoices: Invoice[], deals: Deal[]): Invoice[] {
  return invoices.filter((invoice) => bindInvoice(invoice, deals).status === "unmatched");
}

export function invoicesForDeal(
  invoices: Invoice[],
  deals: Deal[],
  dealId: DealId,
): BoundInvoice[] {
  const bound: BoundInvoice[] = [];
  for (const invoice of invoices) {
    const result = bindInvoice(invoice, deals);
    if (result.status === "bound" && result.dealId === dealId) {
      bound.push({
        invoice,
        via: result.via,
        identityMatch: result.identityMatch,
      });
    }
  }
  return bound;
}

export function joinViaLabel(via: InvoiceBindVia): string {
  switch (via) {
    case "operational-file-number":
      return "Operational File #";
    case "mos-file-id":
      return "MOS file id";
    case "filekey":
      return "FILEKEY";
    default: {
      const _exhaustive: never = via;
      return _exhaustive;
    }
  }
}

export function unmatchedLabel(bind: Extract<InvoiceBind, { status: "unmatched" }>): string {
  switch (bind.ignored) {
    case "borrower-name":
      return "Did not bind on borrower name";
    case "spreadsheet-deal-key":
      return "Did not bind on spreadsheet deal key alone";
    case "none":
      return "No File #, MOS file id, or FILEKEY match";
    default: {
      const _exhaustive: never = bind.ignored;
      return _exhaustive;
    }
  }
}
