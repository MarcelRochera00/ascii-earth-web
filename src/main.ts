import { buildStaticGeometry } from "./geometry";

console.log("ascii-earth-web arranca");
buildStaticGeometry()

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "red";
ctx.fillRect(10, 10, canvas.width, 20);   // x, y, width, height