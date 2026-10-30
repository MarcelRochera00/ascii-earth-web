import { DEFAULT_GEOMETRY, type GeometryConfig } from "./geometry";

export interface AsciiEarthOptions{
    speed: number,
    landColor: [number, number, number],
    waterColor: [number, number, number],
    showMap: boolean,
    tilt: number,
    geometry: GeometryConfig

}

export const DEFAULT_OPTIONS: AsciiEarthOptions = {
    speed: 0.025,
    landColor: [70, 220, 100],
    waterColor: [50, 110, 255],
    showMap: true,
    tilt: 0.35,
    geometry: DEFAULT_GEOMETRY
};

export function resolveOptions(changes: Partial<AsciiEarthOptions> = {}): AsciiEarthOptions{
    return {...DEFAULT_OPTIONS, ...changes};
}