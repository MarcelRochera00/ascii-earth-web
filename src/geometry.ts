export interface GeometryConfig{
    width: number,
    height: number,
    xSep: number,
    ySep: number,
    radius: number,
    camDist: number,
    focal: number 
}

export const DEFAULT_GEOMETRY: GeometryConfig = {
    width: 1280,
    height: 720,
    xSep: 6,
    ySep:12,
    radius:290.0,
    camDist:1100.0,
    focal:1100.0
};


export function buildStaticGeometry(config: GeometryConfig = DEFAULT_GEOMETRY){
    const normals: number[] = [];
    const cells: number[] = [];
    const cols = Math.floor(config.width / config.xSep);
    const rows = Math.floor(config.height / config.ySep);
    const c = config.camDist * config.camDist - config.radius * config.radius;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const px = col * config.xSep + config.xSep / 2 - config.width / 2;
            const py = -(row * config.ySep + config.ySep / 2 - config.height / 2);

            const length = Math.sqrt(px*px + py*py + config.focal*config.focal);
            const dx = px / length;
            const dy = py / length;
            const dz = -config.focal / length;

            const bz = dz * config.camDist;
            const disc = bz*bz - c;

            if(disc>0){
                const t = -bz - Math.sqrt(disc);
                const x = t * dx;
                const y = t * dy;
                const z = config.camDist + t * dz;

                const nx = x / config.radius;
                const ny = y / config.radius;
                const nz = z / config.radius;
                normals.push(nx,ny,nz);
                cells.push(row,col);
            }

        }
    }
    const normalsArray = new Float64Array(normals);
    const cellsArray = new Float64Array(cells);
    return { normals: normalsArray, cells: cellsArray, cols, rows};
}