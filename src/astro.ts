export function getSeason(date: Date = new Date()): string {
    const start = Date.UTC(date.getUTCFullYear(), 0, 1);
    const doy = Math.floor((date.getTime() - start) / (1000 * 60 * 60 * 24)) + 1;
    if (doy >= 80 && doy < 172) {
        return "SPRING";
    }
    else if (doy >= 172 && doy < 265) {
        return "SUMMER";
    }
    else if (doy >= 265 && doy < 355) {
        return "AUTUMN";
    }
    else{
        return "WINTER";
    }
}