import { buildStaticGeometry } from "./geometry";
import { DEFAULT_OPTIONS } from "./options";
import { unpackWorld, computeRows, computeColumns, lookupLand } from "./world";
import { computeLuminance, rotateNormals, smoothLuminance } from "./shading";
import { computeCharIndices, computeColors, drawFrame, GlyphCache } from "./render";
import { getSunVector } from "./astro";

const PYTHON_FPS = 30;

async function main() {
    const canvas = document.querySelector("canvas")!;
    const ctx = canvas.getContext("2d")!;

    const response = await fetch(`${import.meta.env.BASE_URL}world.bin`);
    const buffer = await response.arrayBuffer();
    const bits = unpackWorld(new Uint8Array(buffer));

    const geometry = DEFAULT_OPTIONS.geometry;
    const staticGeometry = buildStaticGeometry(geometry);

    canvas.width = staticGeometry.cols * geometry.xSep;
    canvas.height = staticGeometry.rows * geometry.ySep;

    const cellCount = staticGeometry.normals.length / 3;

    // Created once, reused every frame
    const rotated = new Float64Array(staticGeometry.normals.length);
    const rows = new Int32Array(cellCount);
    const cols = new Int32Array(cellCount);
    const land = new Uint8Array(cellCount);
    const luminance = new Float64Array(cellCount);
    const grid = new Float64Array(staticGeometry.rows * staticGeometry.cols);
    const charIndices = new Uint8Array(cellCount);
    const colors = new Uint8Array(cellCount * 3);
    const glyphCache = new GlyphCache(geometry.xSep, geometry.ySep);

    let spin = 0;
    let lastT = performance.now();
    function frame(now: number) {
        const seconds = (now - lastT) / 1000;   // make step adapt to the screen's Hz
        lastT = now;
        spin = spin + DEFAULT_OPTIONS.speed * PYTHON_FPS * seconds;

        rotateNormals(staticGeometry.normals, DEFAULT_OPTIONS.tilt, spin, rotated);
        computeRows(rotated, rows);
        computeColumns(rotated, spin, cols);
        lookupLand(bits, rows, cols, land);

        const light = getSunVector();
        computeLuminance(rotated, light, luminance);
        smoothLuminance(staticGeometry.cells, luminance, grid, staticGeometry.cols);

        computeCharIndices(luminance, charIndices);
        computeColors(land, luminance, DEFAULT_OPTIONS.landColor, DEFAULT_OPTIONS.waterColor, DEFAULT_OPTIONS.showMap, colors);

        drawFrame(ctx, glyphCache, charIndices, colors, staticGeometry.cells);

        requestAnimationFrame(frame); // ask the browser to call frame again
    }

    requestAnimationFrame(frame); // start loop
}

main();