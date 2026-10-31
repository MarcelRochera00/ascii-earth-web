import { AsciiEarth } from "./AsciiEarth";

const earthsMap = new Map<Element, AsciiEarth>();

// 1. Normal mode
const normalCanvas = document.querySelector("#earth-normal") as HTMLCanvasElement;
if (normalCanvas) {
    const earth = new AsciiEarth(normalCanvas);
    earthsMap.set(normalCanvas,earth);
}

// 2. Fast mode
const fastCanvas = document.querySelector("#earth-fast") as HTMLCanvasElement;
if (fastCanvas) {
    const earth = new AsciiEarth(fastCanvas, { speed: 0.15 });
    earthsMap.set(fastCanvas,earth);
}

// 3. Bigger mode
const largeCanvas = document.querySelector("#earth-large") as HTMLCanvasElement;
if (largeCanvas) {
    const earth = new AsciiEarth(largeCanvas, { width: 1920, height: 1080 });
    earthsMap.set(largeCanvas,earth);
}

// 4. Green color mode
const greenCanvas = document.querySelector("#earth-green") as HTMLCanvasElement;
if (greenCanvas) {
    const earth = new AsciiEarth(greenCanvas, { 
        landColor: [0, 255, 70], 
        waterColor: [0, 20, 10] 
    });
    earthsMap.set(greenCanvas,earth);
}

// 5. No showMap mode
const nomapCanvas = document.querySelector("#earth-nomap") as HTMLCanvasElement;
if (nomapCanvas) {
    const earth = new AsciiEarth(nomapCanvas, { showMap: false });
    earthsMap.set(nomapCanvas,earth);
}

const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        const earth = earthsMap.get(entry.target);
        if (earth === undefined) {
            continue;
        }
        if (entry.isIntersecting) {
            earth.start();
        } else {
            earth.stop();
        }
    }
});

for (const canvas of earthsMap.keys()) {
    observer.observe(canvas);
}