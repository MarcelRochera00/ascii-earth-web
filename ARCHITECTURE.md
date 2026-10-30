# Architecture and Design decisions

*Note: I initially wrote this document for myself to log my learning, track the decisions taken during and before development, and keep a reference for the future. However, if you want to learn how this port works, feel free to read through. If you choose to do so, I strongly suggest reading the whole document instead of going to specific sections to understand my decisions better.*

## Project goal and tools

This project is based off my Python `ascii-earth` project using Pygames. Therefore, since I wanted to change the engine to TypeScript for reusability, the goal was simple: get smooth 60 FPS in the browser without relying on heavy external math or rendering libraries like the Python version does.

Before coding, I used an AI assistant to map out the scope of this project. Moving from a desktop runtime to the browser meant dealing with clear constraints early on, such as memory allocation, DOM paint overhead, and missing native vector operations. That's why I had an *interview* with my AI before starting to understand the basic complexity of these issues and be prepared for them.

Here is how those challenges were handled.

---

## 1. Zero-Allocation Render Loop

Creating objects inside a 60 FPS `requestAnimationFrame` loop triggers garbage collection sweeps that cause micro-stutters. Knowing this shaped how `AsciiEarth` was designed:

* Pre-allocation (`build()` method): Core buffers for normals, cells, rotated vectors, matrix indices, and RGB colors are created once at startup using Typed Arrays (`Float64Array`, `Int32Array`, `Uint8Array`).
* Flat indexing in target buffers: Every tick, functions like `rotateNormals()`, `computeLuminance()`, and `computeColors()` take target buffers and update them in place with flat indexing (`i = i + 3`).
* Adaptive frame delta: The spin step uses elapsed time via `performance.now()` to stay consistent across different screen refresh rates.

---

## 2. Porting NumPy Math to Typed Arrays

The Python version relied on NumPy to handle ray-sphere intersections, solar declination, and lighting dot-products. Porting this without adding dependencies meant writing the trigonometry directly, which sounds a bit scary. This is how I handled some of the problems that arose when NumPy wasn't there to help me:

* Reversing spin for longitude (`computeColumns`): The surface normals are already rotated by `spin`. To locate the original map column, the coordinate system rotates back by `-spin` before calling `atan2(wx, wz)`.
* JS modulo handling: JavaScript's `%` operator preserves negative signs (`-7 % 360` returns `-7`). To map longitudes into the `0..359` range, an explicit check handles negative values (`if (col < 0) col += MAP_COLS`).
* Luminance smoothing: A 2D grid array maps neighbor cells and applies a weighted average (0.5 self, 0.25 left/right neighbors with wrapping borders) to soften geometric edges.

---

## 3. Off-Screen Glyph Caching

Calling `ctx.fillText()` thousands of times per frame on a 2D canvas quickly hits CPU limits, so that's why I decided to implement a small cache:

To avoid this, `GlyphCache` pre-renders characters:
1. Each character index and RGB color pair forms a cache key (`"12-248-184-40"`).
2. The first time a combination appears, it gets drawn to an off-screen `<canvas>` of cell size (`6x12` px) and stored in a Map.
3. Subsequent frames use `ctx.drawImage()` to copy the cached surfaces directly.

---

## 4. Embedded Map Data (Base64 & Bit Unpacking)

To keep the package self-contained on npm without requesting external files:
* The 180×360 global map matrix is stored as a compressed Base64 string (`WORLD_B64`) inside `worldData.ts`.
* `decodeWorld()` turns the Base64 string into a raw byte buffer with `atob()`.
* `unpackWorld()` shifts bits (`(bytes[i] >> j) & 1`) to expand the byte stream into a 1D land/water boolean array.

---

## 5. Code Philosophy & Readability

If you dive into the codebase, you will notice parts that aren't fully optimized or packed into clever one-liners, such as manual flat array indexing (`[i]`, `[i+1]`, `[i+2]`) or step by step loops. 

This might clash with how many people assume the code for a package should be (clean, compressed, fully optimised), but this is my first-ever TypeScript project, and I generally prefer straightforward, readable code over concise abstractions that sacrifice clarity. In this project I tried avoid overly cryptic styles because they make open-source projects harder for people who want to learn. 

However, because this is contains 3D math and a graphics engine, not every file is easy to read and understand. While I've tried to keep the architecture modular, some parts, like the bit-unpacking logic or the spherical coordinate mappings, can still be a bit dense. My goal was simply to write something clean enough that anyone with a bit of curiosity and basic TypeScript knowledge could open it up, step through it, and trace how the engine actually works.

---

## 6. AI Usage

Finally, I used AI as a technical reviewer and a mentor instead of it being code generator:
* Anticipating bottlenecks: It helped identify browser constraints like the ones I mention in the introduction before writing the complicated parts of the code.
* Verifying math: It served as a check when going from NumPy vector equations into native JS loops.
* Code ownership: All array layouts, logic, and tests were written and verified by me. At most, AI wrote 1 or 2 lines that had me stuck for several minutes.