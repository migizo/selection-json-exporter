export function vToHex(v: number): string {
    return v.toString(16).padStart(2, "0");
}

export function vToDenormalize(v: number): number{
    return Math.round(v * 255);
}

export function rgbToHex(color: RGB): string {
    const r = vToDenormalize(color.r);
    const g = vToDenormalize(color.g);
    const b = vToDenormalize(color.b);
    return `#${[r, g, b].map(v => vToHex(v)).join("")}`;
}
