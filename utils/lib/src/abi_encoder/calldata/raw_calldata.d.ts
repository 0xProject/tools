/// <reference types="node" />
export declare class RawCalldata {
    private static readonly _INITIAL_OFFSET;
    private readonly _value;
    private readonly _selector;
    private readonly _scopes;
    private _offset;
    constructor(value: string | Buffer, hasSelector?: boolean);
    popBytes(lengthInBytes: number): Buffer;
    popWord(): Buffer;
    popWords(length: number): Buffer;
    readBytes(from: number, to: number): Buffer;
    setOffset(offsetInBytes: number): void;
    startScope(): void;
    endScope(): void;
    getOffset(): number;
    toAbsoluteOffset(relativeOffset: number): number;
    getSelector(): string;
    getSizeInBytes(): number;
}
//# sourceMappingURL=raw_calldata.d.ts.map