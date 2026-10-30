import { type AsciiEarthOptions, DEFAULT_OPTIONS } from "./options";
import { buildStaticGeometry } from "./geometry";
import { unpackWorld, computeRows, computeColumns, lookupLand } from "./world";
import { computeLuminance, rotateNormals, smoothLuminance } from "./shading";
import { computeCharIndices, computeColors, drawFrame, GlyphCache } from "./render";
import { getSunVector } from "./astro";

const PYTHON_FPS = 30;

export class AsciiEarth {
    private options: AsciiEarthOptions;
    private canvas: HTMLCanvasElement;
    private spin = 0;
    private lastT = 0;
    private animationId = 0;

    constructor(canvas: HTMLCanvasElement, options: Partial<AsciiEarthOptions> = {}) {
        this.canvas = canvas;
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }
    
    // Note: `geometry` is only read in start(), so changing it here has no effect.
    setOptions(changes: Partial<AsciiEarthOptions>) {
        this.options = { ...this.options, ...changes };
    }

    async start() {
        const ctx = this.canvas.getContext("2d")!;
    
        const response = await fetch(`${import.meta.env.BASE_URL}world.bin`);
        const buffer = await response.arrayBuffer();
        const bits = unpackWorld(new Uint8Array(buffer));
    
        const staticGeometry = buildStaticGeometry(this.options.geometry);
    
        this.canvas.width = staticGeometry.cols * this.options.geometry.xSep;
        this.canvas.height = staticGeometry.rows * this.options.geometry.ySep;
    
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
        const glyphCache = new GlyphCache(this.options.geometry.xSep, this.options.geometry.ySep);

        this.spin = 0;
        this.lastT = performance.now();
        const frame = (now: number) => {
            const seconds = (now - this.lastT) / 1000;   // make step adapt to the screen's Hz
            this.lastT = now;
            this.spin = this.spin + this.options.speed * PYTHON_FPS * seconds;
    
            rotateNormals(staticGeometry.normals, this.options.tilt, this.spin, rotated);
            computeRows(rotated, rows);
            computeColumns(rotated, this.spin, cols);
            lookupLand(bits, rows, cols, land);
    
            const light = getSunVector();
            computeLuminance(rotated, light, luminance);
            smoothLuminance(staticGeometry.cells, luminance, grid, staticGeometry.cols);
    
            computeCharIndices(luminance, charIndices);
            computeColors(land, luminance, this.options.landColor, this.options.waterColor, this.options.showMap, colors);
    
            drawFrame(ctx, glyphCache, charIndices, colors, staticGeometry.cells);
    
            this.animationId = requestAnimationFrame(frame); // ask the browser to call frame again
        };
    
        this.animationId = requestAnimationFrame(frame); // start loop
    }
    
    stop() {
        cancelAnimationFrame(this.animationId);
    }
}