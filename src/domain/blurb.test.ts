import { describe, expect, it } from "vitest";
import { seedPatDeal } from "./acquire";
import { cityFromAddress, fileBlurb } from "./blurb";
import { seedDeals } from "./seed";

describe("cityFromAddress", () => {
  it("reads the city from a Canadian street line", () => {
    expect(cityFromAddress("14 Example Lane, Demo City ON M5V 0A1")).toBe("Demo City");
    expect(cityFromAddress("Richmond (city only — no street yet)")).toBe("Richmond");
  });
});

describe("fileBlurb", () => {
  it("writes a one-line job on a lead card", () => {
    expect(fileBlurb(seedPatDeal())).toMatch(/renewal in Richmond/i);
    expect(fileBlurb(seedPatDeal())).toMatch(/whatsapp/i);
    const alex = seedDeals().find((deal) => deal.id === "d-alex");
    expect(alex).toBeDefined();
    expect(fileBlurb(alex!)).toMatch(/Demo City/);
  });
});
