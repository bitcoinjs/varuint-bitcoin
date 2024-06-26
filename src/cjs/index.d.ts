export declare function encode(n: number, buffer: Buffer, offset: number): {
    buffer: Buffer;
    bytes: number;
};
export declare function decode(buffer: Buffer, offset: number): {
    value: number;
    bytes: number;
};
export declare function encodingLength(n: number): 1 | 3 | 5 | 9;
