

export function unpackWorld(bytes: Uint8Array): Uint8Array {
    const bits = new Uint8Array(bytes.length*8);
    for(let i = 0;i<bytes.length;i++){
        for(let j=7;j >= 0;j--){
            bits[8*i + (7-j)] = (bytes[i] >> j) & 1;
        }
    }
    return bits;
}