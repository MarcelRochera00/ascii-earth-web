export function getDayOfYear(date: Date = new Date()): number{
    const start = Date.UTC(date.getUTCFullYear(), 0, 1);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceStart = Math.floor((date.getTime() - start) / msPerDay);
    return daysSinceStart + 1; 
}



export function getSeason(date: Date = new Date()): string{
    const doy = getDayOfYear(date);
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

export function getSunVector(date: Date = new Date()): number[]{
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const declination = -23.44 * Math.cos((360 * (getDayOfYear(date) + 10) / 365.0) * Math.PI / 180);
    const decRad = declination * Math.PI / 180;

    const solarLon = 15.0 * (12.0 - utcHours);
    const solarLonRad = solarLon * Math.PI / 180;

    const sx = Math.cos(decRad) * Math.sin(solarLonRad);
    const sy = Math.sin(decRad);
    const sz = Math.cos(decRad) * Math.cos(solarLonRad);

    const length = Math.sqrt(sx*sx + sy*sy + sz*sz)
    return [sx/length, sy/length, sz/length] //normalize the light vector [sx, sy, sz]
}
