export const MAP_ROWS = 180;
export const MAP_COLS = 360;

// The map has 1 degree per cell, so its rows span 180 degrees of latitude
// (90 to -90) and its columns span 360 degrees of longitude (-180 to 180).
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const RAD_TO_DEG = 180 / Math.PI;

export function unpackWorld(bytes: Uint8Array): Uint8Array {
    const bits = new Uint8Array(bytes.length * 8);
    for (let i = 0; i < bytes.length; i++) {
        for (let j = 7; j >= 0; j--) {
            bits[8 * i + (7 - j)] = (bytes[i] >> j) & 1;
        }
    }
    return bits;
}

export function computeRows(rotated: Float64Array, rows: Int32Array): void {
    for (let i = 0; i < rotated.length; i = i + 3) {
        // filter slightly over bounds values for asin. Ex: 1.000002
        const y = Math.min(Math.max(rotated[i + 1], -1), 1);
        const lat = Math.asin(y) * RAD_TO_DEG;
        const row = Math.trunc(MAX_LATITUDE - lat);
        const clampedRow = Math.min(Math.max(row, 0), MAP_ROWS - 1);
        rows[i / 3] = clampedRow;
    }
}

export function computeColumns(rotated: Float64Array, spin: number, cols: Int32Array): void {
    const cosSpin = Math.cos(spin);
    const sinSpin = Math.sin(spin);

    for (let i = 0; i < rotated.length; i = i + 3) {
        const x = rotated[i];
        const z = rotated[i + 2];

        // IMPORTANT: rotated already has the spin applied, but the Python original this is based off works out the
        // longitude from the normal BEFORE the spin and subtracts `spin` afterwards.
        // Rotating by the same angle in the opposite direction (only the sign of sin
        // changes) gives us that earlier normal back.
        const wx = x * cosSpin + z * sinSpin;
        const wz = -x * sinSpin + z * cosSpin;

        const lon = (Math.atan2(wx, wz) - spin) * RAD_TO_DEG;

        // Order matters here. Python truncates first (astype(int) cuts towards zero)
        // and wraps afterwards. `spin` grows forever, so lon + 180 is often negative,
        // and if we wrapped first we would land one column off in those cases.
        // JavaScript's % keeps the sign of the left side (-7 % 360 is -7, not 353),
        // so the wrap into 0..359 is done by hand.
        let col = Math.trunc(lon + MAX_LONGITUDE) % MAP_COLS;
        if (col < 0) {
            col += MAP_COLS;
        }

        cols[i / 3] = col;
    }
}

export function lookupLand(world: Uint8Array, rows: Int32Array, cols: Int32Array, land: Uint8Array): void {
    for (let i = 0; i < land.length; i++) {
        land[i] = world[rows[i] * MAP_COLS + cols[i]];
    }
}