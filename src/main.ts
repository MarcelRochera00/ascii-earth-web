import { AsciiEarth } from "./AsciiEarth";

async function main() {
    const canvas = document.querySelector("canvas")!;
    const earthCanvas = new AsciiEarth(canvas);
    earthCanvas.start();   
    setTimeout(() => {
        earthCanvas.speed(0.3).width(400).height(200);
    }, 3000);
}

main();