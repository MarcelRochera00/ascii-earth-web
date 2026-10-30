import { readFileSync } from "node:fs";
import { unpackWorld } from "../src/world";
import { expect, test } from "vitest";


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

