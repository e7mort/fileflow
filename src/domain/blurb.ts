import { purposeLabel } from "../lib/format";
import type { Deal } from "../types";

export function cityFromAddress(address: string): string {
  const cityOnly = address.match(/^([^,(]+)\s*\(city only/i);
  if (cityOnly?.[1]) {
    return cityOnly[1].trim();
  }
  const parts = address.split(",");
  if (parts.length >= 2) {
    return parts[1].trim().replace(/\s+[A-Z]{2}\s+\S.*$/, "").trim();
  }
  return address.trim();
}

/** One-line job text on a pipeline card, same job as the screenshot’s description. */
export function fileBlurb(deal: Deal): string {
  const city = cityFromAddress(deal.property.address);
  const via = deal.source ? ` In via ${deal.source}.` : "";
  if (deal.book === "residential") {
    return `Needs a ${purposeLabel(deal.purpose).toLowerCase()} in ${city}.${via}`;
  }
  if (deal.book === "commercial") {
    return `Commercial file in ${city}.${via}`;
  }
  return `Private ${deal.position} in ${city}.${via}`;
}
