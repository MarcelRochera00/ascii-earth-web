import { AsciiEarth } from "./AsciiEarth";

// 1. Normal mode
const normalCanvas = document.querySelector("#earth-normal") as HTMLCanvasElement;
if (normalCanvas) {
    const earth = new AsciiEarth(normalCanvas);
    earth.start();
}

// 2. Fast mode
const fastCanvas = document.querySelector("#earth-fast") as HTMLCanvasElement;
if (fastCanvas) {
    const earth = new AsciiEarth(fastCanvas, { speed: 0.15 });
    earth.start();
}

// 3. Bigger mode
const largeCanvas = document.querySelector("#earth-large") as HTMLCanvasElement;
if (largeCanvas) {
    const earth = new AsciiEarth(largeCanvas, { width: 1920, height: 1080 });
    earth.start();
}

// 4. Green color mode
const greenCanvas = document.querySelector("#earth-green") as HTMLCanvasElement;
if (greenCanvas) {
    const earth = new AsciiEarth(greenCanvas, { 
        landColor: [0, 255, 70], 
        waterColor: [0, 20, 10] 
    });
    earth.start();
}

// 5. No showMap mode
const nomapCanvas = document.querySelector("#earth-nomap") as HTMLCanvasElement;
if (nomapCanvas) {
    const earth = new AsciiEarth(nomapCanvas, { showMap: false });
    earth.start();
}