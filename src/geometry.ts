const WIDTH = 1280;
const HEIGHT = 720;
export const X_SEP = 6;
export const Y_SEP = 12;

export const COLS = Math.floor(WIDTH / X_SEP);
export const ROWS = Math.floor(HEIGHT / Y_SEP);

const RADIUS = 290.0;
const CAM_DIST = 1100.0;
const FOCAL = 1100.0;



export function buildStaticGeometry(){
    const normals: number[] = []
    const cells: number[] = []
    const c = CAM_DIST * CAM_DIST - RADIUS * RADIUS
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const px = col * X_SEP + X_SEP / 2 - WIDTH / 2;
            const py = -(row * Y_SEP + Y_SEP / 2 - HEIGHT / 2);

            const length = Math.sqrt(px*px + py*py + FOCAL*FOCAL);
            const dx = px / length;
            const dy = py / length;
            const dz = -FOCAL / length;

            const bz = dz * CAM_DIST
            const disc = bz*bz - c;

            if(disc>0){
                const t = -bz - Math.sqrt(disc);
                const x = t * dx;
                const y = t * dy;
                const z = CAM_DIST + t * dz;

                const nx = x / RADIUS
                const ny = y / RADIUS
                const nz = z / RADIUS
                normals.push(nx,ny,nz);
                cells.push(row,col);
            }

        }
    }
    const normalsArray = new Float64Array(normals);
    const cellsArray = new Float64Array(cells);
    return { normals: normalsArray, cells: cellsArray };
}