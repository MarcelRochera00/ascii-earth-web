export const CHARS = " .:;!i%&$8S@WM";

const MIN_SHADE = 0.30;
const SHADE_RANGE = 0.70;
const COLOR_STEP = 16;
const COLOR_OFFSET = 8;
const WHITE: [number, number, number] = [255, 255, 255];

function pickBaseColor(isLand: boolean, showMap: boolean, landColor: [number, number, number], waterColor: [number, number, number]): [number, number, number] {
    if (!showMap) {
        return WHITE;
    }
    if (isLand) {
        return landColor;
    }
    return waterColor;
}


export function computeCharIndices(luminance: Float64Array, indices: Uint8Array): void {
    for(let k = 0; k < luminance.length; k++){
        indices[k] =  Math.trunc(luminance[k] * (CHARS.length - 0.01));
    }
}

export function computeColors(land: Uint8Array, luminance: Float64Array, landColor: [number, number, number], waterColor: [number, number, number], showMap: boolean, colors: Uint8Array): void {
    for(let i = 0; i < land.length; i++){
        const shade = MIN_SHADE + SHADE_RANGE * luminance[i];
        const base = pickBaseColor(land[i] === 1, showMap, landColor, waterColor);

        colors[i * 3] = Math.floor((base[0] * shade) / COLOR_STEP) * COLOR_STEP + COLOR_OFFSET; // r
        colors[i * 3 + 1] = Math.floor((base[1] * shade) / COLOR_STEP) * COLOR_STEP + COLOR_OFFSET; // g
        colors[i * 3 + 2] = Math.floor((base[2] * shade) / COLOR_STEP) * COLOR_STEP + COLOR_OFFSET; // b

    }
}


export class GlyphCache {
    private glyphs = new Map<number, HTMLCanvasElement>();

    public readonly cellWidth: number;
    public readonly cellHeight: number;

    constructor(cellWidth: number, cellHeight: number) {
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
    }

    get(charIndex: number, r: number, g: number, b: number): HTMLCanvasElement {
        const key = glyphKey(charIndex, r, g, b);

        const saved = this.glyphs.get(key);
        if (saved !== undefined) {
            return saved;
        }
        else{
            const canvas = document.createElement("canvas")
            canvas.width = this.cellWidth;
            canvas.height = this.cellHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.font = "bold 12px monospace";
            ctx.fillText(CHARS[charIndex], 0, 10)
            this.glyphs.set(key, canvas);
            return canvas;
        }
    }
}

export function glyphKey(charIndex: number, r: number, g: number, b: number): number {
    return ((charIndex * 256 + r) * 256 + g) * 256 + b;
}

export function drawFrame(ctx: CanvasRenderingContext2D, glyphCache: GlyphCache, charIndices: Uint8Array, colors: Uint8Array, cells: Float64Array){
    ctx.fillStyle = "black" // forced black background, can be changed to other colors (future implementation)
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
    
    for(let i = 0; i < charIndices.length; i++){
        const canvasE = glyphCache.get(charIndices[i], colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        ctx.drawImage(canvasE, cells[2*i + 1] * glyphCache.cellWidth, cells[2*i] * glyphCache.cellHeight);

    }
}