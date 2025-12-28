import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "./calc";

describe("calculateCompoundInterest", () => {
  it("matches known values without contributions", () => {
    const result = calculateCompoundInterest({
      principal: 10000,
      annualRatePercent: 5,
      years: 10,
      compoundsPerYear: 12,
      contributionAmount: 0,
      contributionFrequency: "monthly",
    });

    expect(result.finalAmount).toBeCloseTo(16470.0949, 2);
    expect(result.totalInterest).toBeCloseTo(6470.0949, 2);
    expect(result.totalContributions).toBeCloseTo(10000, 2);
    expect(result.yearlyRows.length).toBe(10);
  });

  it("handles annual contributions", () => {
    const result = calculateCompoundInterest({
      principal: 5000,
      annualRatePercent: 7,
      years: 5,
      compoundsPerYear: 4,
      contributionAmount: 150,
      contributionFrequency: "annual",
    });

    expect(result.totalContributions).toBeCloseTo(5750, 2);
    expect(result.finalAmount).toBeGreaterThan(result.totalContributions);
    expect(result.yearlyRows.length).toBe(5);
  });

  it("handles monthly contributions", () => {
    const result = calculateCompoundInterest({
      principal: 5000,
      annualRatePercent: 7,
      years: 5,
      compoundsPerYear: 4,
      contributionAmount: 150,
      contributionFrequency: "monthly",
    });

    expect(result.totalContributions).toBeCloseTo(14000, 2);
    expect(result.finalAmount).toBeCloseTo(17801.5928, 2);
  });
});
