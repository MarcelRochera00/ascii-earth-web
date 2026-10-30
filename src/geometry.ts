import { type AsciiEarthOptions, DEFAULT_OPTIONS } from "./options";

export function buildStaticGeometry(config: AsciiEarthOptions = DEFAULT_OPTIONS){
    const normals: number[] = [];
    const cells: number[] = [];
    const radius = config.height * 290/720;
    const camDist = config.height * 1100/720;
    const focal = config.height * 1100/720;
    const xSep = 6;
    const ySep = 12;
    const cols = Math.floor(config.width / xSep);
    const rows = Math.floor(config.height / ySep);
    const c = camDist * camDist - radius * radius;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const px = col * xSep + xSep / 2 - config.width / 2;
            const py = -(row * ySep + ySep / 2 - config.height / 2);

            const length = Math.sqrt(px*px + py*py + focal*focal);
            const dx = px / length;
            const dy = py / length;
            const dz = -focal / length;

            const bz = dz * camDist;
            const disc = bz*bz - c;

            if(disc>0){
                const t = -bz - Math.sqrt(disc);
                const x = t * dx;
                const y = t * dy;
                const z = camDist + t * dz;

                const nx = x / radius;
                const ny = y / radius;
                const nz = z / radius;
                normals.push(nx,ny,nz);
                cells.push(row,col);
            }

        }
    }
    const normalsArray = new Float64Array(normals);
    const cellsArray = new Float64Array(cells);
    return { normals: normalsArray, cells: cellsArray, cols, rows};
}