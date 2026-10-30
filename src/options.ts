export interface AsciiEarthOptions {
    width: number;
    height: number;
    speed: number;
    tilt: number;
    landColor: [number, number, number];
    waterColor: [number, number, number];
    showMap: boolean;
}

export const DEFAULT_OPTIONS: AsciiEarthOptions = {
    width: 1280,
    height: 720,
    speed: 0.025,
    tilt: 0.35,
    landColor: [70, 220, 100],
    waterColor: [50, 110, 255],
    showMap: true,
};
