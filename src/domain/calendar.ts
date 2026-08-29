import type { Consult, Deal, DealId } from "../types";
import { primaryBorrower } from "./parties";

export type CalendarEventKind = "next-action" | "maturity" | "consult";

export type CalendarEvent = {
  dealId: DealId;
  date: string;
  kind: CalendarEventKind;
  title: string;
  borrowerName: string;
};

export function calendarEvents(deals: Deal[], consults: Consult[] = []): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const deal of deals) {
    const borrowerName = primaryBorrower(deal).name;
    if (deal.nextAction.due) {
      events.push({
        dealId: deal.id,
        date: deal.nextAction.due,
        kind: "next-action",
        title: deal.nextAction.title,
        borrowerName,
      });
    }
    if (deal.maturityDate) {
      events.push({
        dealId: deal.id,
        date: deal.maturityDate,
        kind: "maturity",
        title: "Maturity / renewal reminder",
        borrowerName,
      });
    }
  }
  for (const consult of consults) {
    const deal = deals.find((item) => item.id === consult.dealId);
    events.push({
      dealId: consult.dealId,
      date: consult.startsAt.slice(0, 10),
      kind: "consult",
      title: "Consult booked",
      borrowerName: deal ? primaryBorrower(deal).name : "New lead",
    });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function eventsOnDate(events: CalendarEvent[], isoDate: string): CalendarEvent[] {
  return events.filter((event) => event.date === isoDate);
}

export function monthCells(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(year, monthIndex, 1);
  const pad = first.getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < pad; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= days; day += 1) {
    const month = String(monthIndex + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");
    cells.push(`${year}-${month}-${date}`);
  }
  return cells;
}
