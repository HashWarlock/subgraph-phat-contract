import {Error} from "./errors";

export function isHexString(str: string): boolean {
    const regex = /^0x[0-9a-f]+$/;
    return regex.test(str.toLowerCase());
}

export function stringToHex(str: string): string {
    var hex = "";
    for (var i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16);
    }
    return "0x" + hex;
}

export function parseProfileId(hexx: string): string {
    var hex = hexx.toString();
    if (!isHexString(hex)) {
        throw Error.BadTargetAddress;
    }
    hex = hex.slice(2);
    var str = "";
    for (var i = 0; i < hex.length; i += 2) {
        const ch = String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
        str += ch;
    }
    return str;
}
