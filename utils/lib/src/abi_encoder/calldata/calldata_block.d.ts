/// <reference types="node" />
export declare abstract class CalldataBlock {
    private readonly _signature;
    private readonly _parentName;
    private _name;
    private _offsetInBytes;
    private _headerSizeInBytes;
    private _bodySizeInBytes;
    constructor(name: string, signature: string, parentName: string, headerSizeInBytes: number, bodySizeInBytes: number);
    protected _setHeaderSize(headerSizeInBytes: number): void;
    protected _setBodySize(bodySizeInBytes: number): void;
    protected _setName(name: string): void;
    getName(): string;
    getParentName(): string;
    getSignature(): string;
    getHeaderSizeInBytes(): number;
    getBodySizeInBytes(): number;
    getSizeInBytes(): number;
    getOffsetInBytes(): number;
    setOffset(offsetInBytes: number): void;
    computeHash(): Buffer;
    abstract toBuffer(): Buffer;
    abstract getRawData(): Buffer;
}
//# sourceMappingURL=calldata_block.d.ts.map