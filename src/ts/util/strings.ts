export function padStart(str: string, targetLength: number, padString: string = " ") {
    if(str.length >= targetLength) return str;

    let padding = "";
    for(let i = 0; i < targetLength - str.length; i++) {
        padding += padString;
    }

    return padding + str;
}