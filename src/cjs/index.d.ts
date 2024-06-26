export declare function encode(n: number, buffer?: Uint8Array, offset?: number): {
    buffer: Uint8Array;
    bytes: number;
};
export declare function decode(buffer: Uint8Array, offset?: number): {
    value: number;
    bytes: number;
};
export declare function encodingLength(n: number): number;
