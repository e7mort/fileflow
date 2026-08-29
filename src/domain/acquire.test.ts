import { describe, expect, it } from "vitest";
import { formatCadCompact } from "../lib/format";
import {
  availableSlots,
  buildIntakeLead,
  parseAmount,
  parsePurpose,
  pipelineKpis,
  replyToLead,
  seedConsults,
  seedConversations,
  seedPatDeal,
  startConversation,
} from "./acquire";
import { DEMO_TODAY } from "./maturity";
import { seedDeals } from "./seed";

describe("parsePurpose / parseAmount", () => {
  it("maps plain words to mortgage purposes", () => {
    expect(parsePurpose("I need to renew")).toBe("renewal");
    expect(parsePurpose("buying a place")).toBe("purchase");
    expect(parsePurpose("refi to pull equity")).toBe("refinance");
    expect(parsePurpose("hello")).toBeNull();
  });

  it("reads 680k and 680000 as the same amount", () => {
    expect(parseAmount("680k")).toBe(680000);
    expect(parseAmount("$680,000")).toBe(680000);
    expect(parseAmount("1.2m")).toBe(1200000);
    expect(parseAmount("50")).toBeNull();
  });
});

describe("formatCadCompact", () => {
  it("shortens column totals the way the jobs board does", () => {
    expect(formatCadCompact(0)).toBe("$0");
    expect(formatCadCompact(16200)).toBe("$16.2k");
    expect(formatCadCompact(1_850_000)).toBe("$1.9M");
  });
});

describe("intake bot", () => {
  it("qualifies a lead and books a consult onto a Lead file", () => {
    let convo = startConversation({
      id: "c-dana",
      channel: "sms",
      name: "Dana Textin",
      phone: "250-555-0110",
      firstLeadLine: "Can you look at my mortgage?",
      now: "2026-08-14T11:00:00.000Z",
    });
    convo = replyToLead(convo, "purchase", [], "2026-08-14T11:01:00.000Z").conversation;
    convo = replyToLead(convo, "Burnaby", [], "2026-08-14T11:02:00.000Z").conversation;
    convo = replyToLead(convo, "540k", [], "2026-08-14T11:03:00.000Z").conversation;
    convo = replyToLead(convo, "this month", [], "2026-08-14T11:04:00.000Z").conversation;
    const booked = replyToLead(convo, "2", [], "2026-08-14T11:05:00.000Z");
    expect(booked.deal?.stage).toBe("lead");
    expect(booked.deal?.amount).toBe(540000);
    expect(booked.deal?.purpose).toBe("purchase");
    expect(booked.consult?.slotId).toBe("s-0818-14");
    expect(booked.conversation.step).toBe("handed-off");
    expect(booked.deal?.nextAction.ownerId).toBe("p-riley");
    expect(booked.deal?.nextAction.title).toContain("Dana Textin");
    expect(booked.deal?.nextAction.waitingOn?.personId).toBe("p-riley");
  });

  it("does not double-book a taken slot", () => {
    const taken = seedConsults();
    const open = availableSlots(taken);
    expect(open.some((slot) => slot.id === "s-0815-10")).toBe(false);
    let convo = startConversation({
      id: "c-late",
      channel: "web",
      name: "Late Lead",
      phone: "604-555-0100",
      purpose: "renewal",
      now: "2026-08-14T12:00:00.000Z",
    });
    convo = replyToLead(convo, "Vancouver", taken, "2026-08-14T12:01:00.000Z").conversation;
    convo = replyToLead(convo, "400000", taken, "2026-08-14T12:02:00.000Z").conversation;
    convo = replyToLead(convo, "soon", taken, "2026-08-14T12:03:00.000Z").conversation;
    const booked = replyToLead(convo, "1", taken, "2026-08-14T12:04:00.000Z");
    expect(booked.consult?.slotId).not.toBe("s-0815-10");
    expect(booked.consult?.slotId).toBe(open[0]?.id);
  });
});

describe("pipeline KPIs", () => {
  it("counts open pipeline, funded this month, consults, and all-time funded", () => {
    const deals = seedDeals();
    const kpis = pipelineKpis(deals, seedConsults(), DEMO_TODAY);
    expect(kpis.consultsThisMonth).toBe(1);
    expect(kpis.fundedThisMonth).toBeGreaterThan(0);
    expect(kpis.allTimeFunded).toBeGreaterThan(kpis.fundedThisMonth);
    expect(kpis.openPipeline).toBeGreaterThan(kpis.fundedThisMonth);
  });
});

describe("seeded acquisition thread", () => {
  it("hands Pat Inbound to Riley with a booked Friday consult", () => {
    const threads = seedConversations();
    const pat = threads.find((thread) => thread.id === "c-pat");
    expect(pat?.step).toBe("handed-off");
    expect(pat?.dealId).toBe("d-pat");
    const deal = seedPatDeal();
    expect(deal.id).toBe("d-pat");
    expect(buildIntakeLead({
      id: "d-x",
      name: "X",
      phone: "1",
      purpose: "renewal",
      city: "Richmond",
      amount: 1_000,
      slot: availableSlots([])[0]!,
      now: "2026-08-14T09:00:00.000Z",
      source: "whatsapp",
    }).stage).toBe("lead");
  });
});
