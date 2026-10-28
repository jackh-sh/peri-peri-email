import { describe, expect, it } from "vitest";

import {
  DEFAULT_FLAVOUR,
  FLAVOURS,
  buildSystemPrompt,
  buildUserPrompt,
  getFlavour,
  isFlavourId,
} from "./flavours";

describe("FLAVOURS", () => {
  it("runs from Plain...ish to Extra Hot", () => {
    expect(FLAVOURS.map((f) => f.name)).toEqual([
      "Plain...ish",
      "Lemon & Herb",
      "Mango & Lime",
      "Medium",
      "Hot",
      "Extra Hot",
    ]);
  });

  it("has heat matching each flavour's position", () => {
    FLAVOURS.forEach((flavour, index) => expect(flavour.heat).toBe(index));
  });

  it("has a valid default", () => {
    expect(isFlavourId(DEFAULT_FLAVOUR)).toBe(true);
  });
});

describe("getFlavour / isFlavourId", () => {
  it("looks flavours up by id", () => {
    expect(getFlavour("extra-hot").name).toBe("Extra Hot");
  });

  it("rejects unknown ids", () => {
    expect(isFlavourId("nuclear")).toBe(false);
    expect(isFlavourId(undefined)).toBe(false);
  });
});

describe("buildSystemPrompt", () => {
  it("includes the target flavour, its heat and its tone", () => {
    const hot = getFlavour("hot");
    const prompt = buildSystemPrompt(hot);
    expect(prompt).toContain("Target heat: Hot (4 of 5)");
    expect(prompt).toContain(hot.tone);
  });

  it("keeps the safety rules at every heat", () => {
    for (const flavour of FLAVOURS) {
      expect(buildSystemPrompt(flavour)).toContain("no threats of violence");
    }
  });
});

describe("buildUserPrompt", () => {
  it("wraps the trimmed email in tags", () => {
    expect(buildUserPrompt("  Hi Sam  \n")).toBe("<email>\nHi Sam\n</email>");
  });
});
