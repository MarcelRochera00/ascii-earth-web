import { expect, test } from "vitest";
import fixtures from "./fixtures.json";
import { getSeason } from "../src/astro";

test("compare seasons calculations with fixtures", () => {
    const fixturesSeasonsData = fixtures.sun
  for (const f of fixturesSeasonsData) {
    expect(getSeason(new Date(f.date))).toBe(f.season);
  }
});