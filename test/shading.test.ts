import { expect, test } from "vitest";
import { buildStaticGeometry, COLS, ROWS } from "../src/geometry";
import { computeLuminance, rotateNormals, smoothLuminance } from "../src/shading";
import fixtures from "./fixtures.json";
import { getSunVector } from "../src/astro";

const geometry = buildStaticGeometry();
const cellCount = geometry.cells.length / 2;

// created once, then reused
const rotated = new Float64Array(geometry.normals.length);
const luminance = new Float64Array(cellCount);
const grid = new Float64Array(ROWS * COLS);

test("luminance matches fixture", () => {
  for (const c of fixtures.shading) {
    rotateNormals(geometry.normals, c.tilt, c.spin, rotated);
    computeLuminance(rotated, getSunVector(new Date(c.date)), luminance);
    smoothLuminance(geometry.cells, luminance, grid);
    expect(luminance.length).toBe(c.lum.length);
    for (let k = 0; k < luminance.length; k++) {
        expect(luminance[k]).toBeCloseTo(c.lum[k], 10);
    }
  }
});