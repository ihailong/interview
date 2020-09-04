import base62 from "base62";


export function encodeBase62(inputNumber: number): string {
    return base62.encode(inputNumber);
}


export function decodeBase62(code: string): number {
    return base62.decode(code);
}
