export module Strings {
    export function padStart(str: string, targetLength: number, padString: string = " ") {
        if(str.length >= targetLength) return str;

        let padding = "";
        for(let i = 0; i < targetLength - str.length; i++) {
            padding += padString;
        }

        return padding + str;
    }

    export function insertEvery(str: string, insert: string, interval: number) {
        let result = "";
        for(let i = 0; i < str.length; i++) {
            if(i % interval === 0 && i !== 0) result += insert;
            result += str[i];
        }
        return result;
    }
}