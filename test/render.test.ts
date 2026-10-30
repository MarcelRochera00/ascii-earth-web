import { expect, test } from "vitest";
import { computeCharIndices, computeColors } from "../src/render";

const LAND: [number, number, number] = [70, 220, 100];
const WATER: [number, number, number] = [50, 110, 255];

test("brightness maps to the right character position", () => {
    const luminance = new Float64Array([0.0, 0.08, 0.5, 1.0]);
    const indices = new Uint8Array(4);

    computeCharIndices(luminance, indices);

    expect(indices).toEqual(new Uint8Array([
        0,   // 0.00 * 13.99 = 0.00, the space
        1,   // 0.08 * 13.99 = 1.11
        6,   // 0.50 * 13.99 = 6.99
        13,  // 1.00 * 13.99 = 13.99, the last character
    ]));
});

test("each cell gets its own color, land and water", () => {
    const land = new Uint8Array([1, 0]);
    const luminance = new Float64Array([1.0, 1.0]);
    const colors = new Uint8Array(6);

    computeColors(land, luminance, LAND, WATER, true, colors);

    expect(colors).toEqual(new Uint8Array([
        72, 216, 104,   // land: 70, 220, 100 -> multiples of 16, plus 8
        56, 104, 248,   // water: 50, 110, 255
    ]));
});

test("without map every cell is white, even in land", () => {
    const land = new Uint8Array([1]);
    const luminance = new Float64Array([1.0]);
    const colors = new Uint8Array(3);

    computeColors(land, luminance, LAND, WATER, false, colors);

    expect(colors).toEqual(new Uint8Array([248, 248, 248]));
});

test("dark cells keep 30% of their color", () => {
    const land = new Uint8Array([1]);
    const luminance = new Float64Array([0.0]);
    const colors = new Uint8Array(3);

    computeColors(land, luminance, LAND, WATER, true, colors);

    expect(colors).toEqual(new Uint8Array([24, 72, 24]));
});