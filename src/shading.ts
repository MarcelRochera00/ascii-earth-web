import { getSunVector } from "./astro";
import { COLS, ROWS } from "./geometry";

const CHARS = " .:;!i%&$8S@WM"
const AMBIENT = 0.08

const OCEAN_RGB = [50, 110, 255]
const LAND_RGB = [70, 220, 100]


export function rotateNormals(normals: Float64Array, tilt: number, spin: number, rotated: Float64Array): void {
    const cosSpin = Math.cos(spin);
    const sinSpin = Math.sin(spin);

    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    
    for(let i = 0; i<normals.length;i=i+3){
        const wy = cosTilt * normals[i+1] + sinTilt * normals[i+2];
        const wz = -sinTilt * normals[i+1] + cosTilt * normals[i+2];
        const wx = normals[i];

        rotated[i] = wx * cosSpin - wz * sinSpin; // x
        rotated[i+1] = wy; // y
        rotated[i+2] = wx * sinSpin + wz * cosSpin; // z
    }
}


export function computeLuminance(rotated: Float64Array, light: number[], luminance: Float64Array): void {
    for(let i = 0; i<rotated.length;i=i+3){
        const x = rotated[i];
        const y = rotated[i+1];
        const z = rotated[i+2];
        const diffuse = Math.min(Math.max(x * light[0] + y * light[1] + z * light[2], 0), 1);
        const lum = AMBIENT + (1 - AMBIENT) * diffuse ** 0.85;

        luminance[i/3] = lum;
    }
}

export function smoothLuminance(cells: Float64Array, luminance: Float64Array, grid: Float64Array): void {
    for (let k = 0; k < luminance.length; k++) {
        const row = cells[2 * k];
        const col = cells[2 * k + 1];
        grid[row*COLS + col] = luminance[k];
    }

    for (let j = 0; j < luminance.length; j++) {
        const row = cells[2 * j];
        const col = cells[2 * j + 1];
        let colL = col-1;
        if(colL < 0){colL = COLS-1;}
        let colR = col+1;
        if(colR >= COLS){colR = 0;}
        luminance[j] = 0.5 * grid[row*COLS + col] + 0.25 * grid[row*COLS + colL] + 0.25 * grid[row*COLS + colR];
    }
}