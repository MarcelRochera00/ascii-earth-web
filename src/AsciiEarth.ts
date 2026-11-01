import { type AsciiEarthOptions, DEFAULT_OPTIONS } from "./options";
import { buildStaticGeometry } from "./geometry";
import { decodeWorld, unpackWorld, computeRows, computeColumns, lookupLand } from "./world";
import { computeLuminance, rotateNormals, smoothLuminance } from "./shading";
import { computeCharIndices, computeColors, drawFrame, GlyphCache } from "./render";
import { getSunVector } from "./astro";
import { WORLD_B64 } from "./worldData";

const PYTHON_FPS = 30;
export type StaticGeometry = ReturnType<typeof buildStaticGeometry>;

export class AsciiEarth {
    private options: AsciiEarthOptions;
    private canvas: HTMLCanvasElement;
    private spin = 0;
    private lastT = 0;
    private animationId = 0;
    private staticGeometry!: StaticGeometry;
    private rotated!: Float64Array;
    private rows!: Int32Array;
    private cols!: Int32Array;
    private land!: Uint8Array;
    private luminance!: Float64Array;
    private grid!: Float64Array;
    private charIndices!: Uint8Array;
    private colors!: Uint8Array;
    private glyphCache!: GlyphCache;

    constructor(canvas: HTMLCanvasElement, options: Partial<AsciiEarthOptions> = {}) {
        this.canvas = canvas;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.build()
    }


    build() {
        this.staticGeometry = buildStaticGeometry(this.options);
        const cellCount = this.staticGeometry.normals.length / 3;

        this.rotated = new Float64Array(this.staticGeometry.normals.length);
        this.rows = new Int32Array(cellCount);
        this.cols = new Int32Array(cellCount);
        this.land = new Uint8Array(cellCount);
        this.luminance = new Float64Array(cellCount);
        this.grid = new Float64Array(this.staticGeometry.rows * this.staticGeometry.cols);
        this.charIndices = new Uint8Array(cellCount);
        this.colors = new Uint8Array(cellCount * 3);
        this.glyphCache = new GlyphCache(6, 12); // hardcoded ySep and xSep

        this.canvas.width = this.staticGeometry.cols * 6;
        this.canvas.height = this.staticGeometry.rows * 12;
    }

    start() {
        if(this.animationId !== 0){
            return;
        }
        const ctx = this.canvas.getContext("2d")!;
        const bits = unpackWorld(decodeWorld(WORLD_B64));

        this.lastT = performance.now();
        const frame = (now: number) => {
            const seconds = Math.min((now - this.lastT) / 1000, 0.2);   // make step adapt to the screen's Hz
            this.lastT = now;
            this.spin = this.spin + this.options.speed * PYTHON_FPS * seconds;
    
            rotateNormals(this.staticGeometry.normals, this.options.tilt, this.spin, this.rotated);
            computeRows(this.rotated, this.rows);
            computeColumns(this.rotated, this.spin, this.cols);
            lookupLand(bits, this.rows, this.cols, this.land);
    
            const light = getSunVector();
            computeLuminance(this.rotated, light, this.luminance);
            smoothLuminance(this.staticGeometry.cells, this.luminance, this.grid, this.staticGeometry.cols);
    
            computeCharIndices(this.luminance, this.charIndices);
            computeColors(this.land, this.luminance, this.options.landColor, this.options.waterColor, this.options.showMap, this.colors);
    
            drawFrame(ctx, this.glyphCache, this.charIndices, this.colors, this.staticGeometry.cells);
    
            this.animationId = requestAnimationFrame(frame); // ask the browser to call frame again
        };
    
        this.animationId = requestAnimationFrame(frame); // start loop
    }
    
    stop() {
        cancelAnimationFrame(this.animationId);
        this.animationId = 0;
    }

    // SETTERS

    setOptions(changes: Partial<AsciiEarthOptions>): this {
        this.options = { ...this.options, ...changes };
        return this;
    }

    speed(value: number): this {
        return this.setOptions({ speed: value });
    }

    tilt(value: number): this {
        return this.setOptions({ tilt: value });
    }

    landColor(value: [number, number, number]): this {
        return this.setOptions({ landColor: value });
    }

    waterColor(value: [number, number, number]): this {
        return this.setOptions({ waterColor: value });
    }

    showMap(value: boolean): this {
        return this.setOptions({ showMap: value });
    }

    width(value: number): this {
        this.setOptions({ width: value });
        this.build();
        return this;
    }

    height(value: number): this {
        this.setOptions({ height: value });
        this.build();
        return this;
    }
}