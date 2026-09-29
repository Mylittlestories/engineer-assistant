import { describe, expect, it } from "vitest";
import {
  buildBackup,
  calculateChemicalDoseLiters,
  calculateEngineSlipPercent,
  calculateFuelMtDay,
  calculateGeneratorLoadPercent,
  calculatePumpFlowM3Hour,
  calculateSfoc,
  calculateTransferTimeHours,
  decodeAlarm,
  parseBackup,
  searchManualDocuments,
  type ManualDocument,
} from "./shipAssistant";

describe("engineering calculators", () => {
  it("calculates marine fuel consumption and SFOC", () => {
    expect(calculateFuelMtDay(850)).toBe(20.4);
    expect(calculateSfoc(850, 6000)).toBe(141.67);
  });

  it("calculates transfer time and actual pump flow", () => {
    expect(calculateTransferTimeHours(120, 45)).toBe(2.67);
    expect(calculatePumpFlowM3Hour(120, 90)).toBe(80);
  });

  it("calculates generator load, slip, and chemical dose", () => {
    expect(calculateGeneratorLoadPercent(650, 1000)).toBe(65);
    expect(calculateEngineSlipPercent(15, 13.8)).toBe(8);
    expect(calculateChemicalDoseLiters(120, 40, 25)).toBe(19.2);
  });
});

describe("manual vault search", () => {
  const docs: ManualDocument[] = [
    {
      id: "manual-1",
      title: "Main engine manual",
      source: "Section 701",
      content: "Oil mist detector alarm requires engine load reduction, cooling period, and no crankcase doors opened before safe inspection.",
      addedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "manual-2",
      title: "Purifier manual",
      source: "Chapter 4",
      content: "Water carry-over can be caused by incorrect gravity disc, high throughput, dirty bowl, or low separation temperature.",
      addedAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  it("returns the best matching manual snippets", () => {
    const result = searchManualDocuments("oil mist crankcase alarm", docs, 2);
    expect(result[0].title).toBe("Main engine manual");
    expect(result[0].excerpt.toLowerCase()).toContain("oil mist");
  });
});

describe("alarm decoder", () => {
  it("recognizes critical alarm patterns", () => {
    expect(decodeAlarm("OMD oil mist detector unit 4").title).toContain("Crankcase");
    expect(decodeAlarm("generator frequency fluctuation and hunting").title).toContain("Generator hunting");
  });
});

describe("backup", () => {
  it("builds and parses Engineer Assistant backups", () => {
    const raw = buildBackup({ logbook: [{ note: "ok" }] });
    const parsed = parseBackup(raw);
    expect(parsed.app).toBe("Engineer Assistant");
    expect(parsed.logbook[0].note).toBe("ok");
  });

  it("rejects invalid backups", () => {
    expect(() => parseBackup(JSON.stringify({ app: "Other" }))).toThrow(/not an Engineer Assistant backup/);
  });
});
