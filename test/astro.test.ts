import { expect, test } from "vitest";
import fixtures from "./fixtures.json";
import { getSeason, getSunVector } from "../src/astro";

test("compare seasons calculations with fixtures", () => {
    const fixturesSeasonsData = fixtures.sun
    for (const f of fixturesSeasonsData) {
      expect(getSeason(new Date(f.date))).toBe(f.season);
    }
});

test("compare sun vector calculations with fixtures", () => {
  const fixturesSunVectorData = fixtures.sun
  for (const f of fixturesSunVectorData) {
    const sunVector = getSunVector(new Date(f.date));
    for (let i = 0; i < sunVector.length; i++){
      expect(sunVector[i]).toBeCloseTo(f.vector[i], 10);
    }
  }
});