import { Strings } from "./util/strings";

export function formatBinary(num: number, bits: number = Math.max(8, Math.ceil(Math.log2(num) / 8) * 8)): string {
    const binary = num.toString(2);
    const padded = Strings.padStart(binary, bits, "0");
    const spaced = Strings.insertEvery(padded, ' ', 8);
    return spaced;
}

function formatUnit(num: number, unit: string, short: boolean): string {
    const prefixes = ["", "ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi", "Yi"];
    const prefixIndex = num === 0 ? 0 : Math.floor(Math.log2(num) / 10);
    const significant = num / 2 ** (prefixIndex * 10);
    const floored = Math.floor(significant * 1000) / 1000;
    const formattedNum = new Intl.NumberFormat(navigator.language, {
        minimumFractionDigits: short ? 0 : 3,
        maximumFractionDigits: short ? 0 : 3,
    }).format(floored);
    return `${formattedNum} ${prefixes[prefixIndex]}${unit}`;
}

export function formatBits(num: number, short: boolean = false): string {
    if(num < 1024 * 8) {
        const formattedNum = new Intl.NumberFormat(navigator.language).format(num);
        return `${formattedNum} b`
    }
    return formatUnit(num / 8, "B", short);
}

export function formatHertz(num: number, short: boolean = false): string {
    return formatUnit(num, "Hz", short);
}

export function formatTime(seconds: number): string {
    const secondsMod = Math.floor(seconds % 60);
    const minutes = Math.floor(seconds / 60) % 60;
    const hours = Math.floor(seconds / 3600);
    const parts = [];
    if(hours > 0) {
        parts.push(hours + "h");
    }
    if(minutes > 0) {
        parts.push(minutes + "m");
    }
    if(secondsMod > 0) {
        parts.push(secondsMod + "s");
    }
    return parts.join(", ");
}