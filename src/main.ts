import { AsciiEarth } from "./AsciiEarth";

async function main() {
    const canvas = document.querySelector("canvas")!;
    const earthCanvas = new AsciiEarth(canvas);
    earthCanvas.start();   
    setTimeout(() => {
        earthCanvas.setOptions({ speed: 0.1 });
    }, 3000);
}

main();