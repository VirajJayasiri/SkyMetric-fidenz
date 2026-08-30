import { describe, expect, it } from "vitest";
import { calculateComfortIndex } from "./comfortIndex";

describe("calculateComfortIndex", () => {
  it("returns 100 for ideal weather conditions", () => {
    const score = calculateComfortIndex(22, 50, 3);

    expect(score).toBe(100);
  });

  it("reduces the score when temperature is uncomfortable", () => {
    const score = calculateComfortIndex(30, 50, 3);

    expect(score).toBe(80);
  });

  it("reduces the score when humidity is uncomfortable", () => {
    const score = calculateComfortIndex(22, 80, 3);

    expect(score).toBe(82);
  });

  it("reduces the score when wind speed is uncomfortable", () => {
    const score = calculateComfortIndex(22, 50, 10);

    expect(score).toBe(86);
  });

  it("never returns a score below 0 for extreme conditions", () => {
    const score = calculateComfortIndex(100, 100, 100);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns the same result for the same weather conditions", () => {
    const firstScore = calculateComfortIndex(24, 60, 3);
    const secondScore = calculateComfortIndex(24, 60, 3);

    expect(firstScore).toBe(secondScore);
    expect(firstScore).toBe(89);
  });
});