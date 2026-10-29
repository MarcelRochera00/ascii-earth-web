import { expect, test } from "vitest";
import { buildStaticGeometry } from "../src/geometry";
import fixtures from "./fixtures.json";

const STEP = 50; // Python saves one of every 50 cells

const geometry = buildStaticGeometry();
const fixture = fixtures.geometry[0];

function compareSampled(flat: Float64Array, valuesPerCell: number, sampled: number[][]): void {
  for (let i = 0; i < sampled.length; i++) {
    const start = i * STEP * valuesPerCell;
    for (let k = 0; k < valuesPerCell; k++) {
      expect(flat[start + k]).toBeCloseTo(sampled[i][k], 10);
    }
  }
}

test("number of hit cells matches Python", () => {
  const hitCount = geometry.cells.length / 2;
  expect(Math.ceil(hitCount / STEP)).toBe(fixture.n_hit.length);
});

test("normals match Python", () => {
  compareSampled(geometry.normals, 3, fixture.n_hit);
});

test("cells match Python", () => {
  compareSampled(geometry.cells, 2, fixture.cells);
});