import { readFileSync } from "node:fs";
import { computeColumns, computeRows, lookupLand, unpackWorld } from "../src/world";
import { expect, test } from "vitest";
import fixtures from "./fixtures.json";
import { rotateNormals } from "../src/shading";
import { buildStaticGeometry } from "../src/geometry";

test("unpacked world data matches expected size", () => {
    const bytes = readFileSync("public/world.bin");
    expect(unpackWorld(bytes).length).toBe(64800)
});

test("unpacked world data matches expected SUM", () => {
    const bytes = readFileSync("public/world.bin");
    const bits = unpackWorld(bytes);
    let total = 0;
    for (let i = 0; i < bits.length; i++) {
        total += bits[i];
    }
    expect(total).toBe(21546);
});


export function loadWorldBits(): Uint8Array {
    const bytes = readFileSync("public/world.bin");
    return unpackWorld(bytes);
}

test("final land data matches fixture land values", () => {
    const bits = loadWorldBits();
    const staticData = buildStaticGeometry()
    for(const c of fixtures.shading){
        const rotated = new Float64Array(staticData.normals.length);
        const rows = new Int32Array(rotated.length/3);
        const cols = new Int32Array(rotated.length/3);
        const land = new Uint8Array(rotated.length/3);

        rotateNormals(staticData.normals, c.tilt, c.spin, rotated);
        computeRows(rotated, rows);
        computeColumns(rotated, c.spin, cols);
        lookupLand(bits, rows, cols, land);
        
        expect(land.length).toBe(c.land.length);
        for (let k = 0; k < land.length; k++) {
            expect(land[k]).toBe(c.land[k] ? 1 : 0);
        }
    }

});

