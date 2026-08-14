import type { Book, ResidentialPurpose } from "../types";

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export function formatCad(amount: number): string {
  return cad.format(amount);
}

export function formatDate(iso: string | null): string {
  if (!iso) {
    return "No date";
  }
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function bookLabel(book: Book): string {
  switch (book) {
    case "residential":
      return "Residential";
    case "commercial":
      return "Commercial";
    case "private":
      return "Private";
    default: {
      const _exhaustive: never = book;
      return _exhaustive;
    }
  }
}

export function purposeLabel(purpose: ResidentialPurpose): string {
  switch (purpose) {
    case "purchase":
      return "Purchase";
    case "refinance":
      return "Refinance";
    case "renewal":
      return "Renewal";
    case "switch":
      return "Switch";
    default: {
      const _exhaustive: never = purpose;
      return _exhaustive;
    }
  }
}
