# ascii-earth

A rotating 3D Earth drawn with ASCII characters on a canvas, lit by the real position of the sun.

## Install

```
npm install ascii-earth
```

## Usage

```ts
import { AsciiEarth } from "ascii-earth";

const canvas = document.querySelector("canvas")!;
const earth = new AsciiEarth(canvas, { speed: 0.025 });
earth.start();
```

## License

MIT