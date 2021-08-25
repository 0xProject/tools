/// <reference types="node" />
import { CalldataBlock } from '../calldata_block';
export declare class PointerCalldataBlock extends CalldataBlock {
    static readonly RAW_DATA_START: Buffer;
    static readonly RAW_DATA_END: Buffer;
    private static readonly _DEPENDENT_PAYLOAD_SIZE_IN_BYTES;
    private static readonly _EMPTY_HEADER_SIZE;
    private readonly _parent;
    private readonly _dependency;
    private _aliasFor;
    constructor(name: string, signature: string, parentName: string, dependency: CalldataBlock, parent: CalldataBlock);
    toBuffer(): Buffer;
    getDependency(): CalldataBlock;
    setAlias(block: CalldataBlock): void;
    getAlias(): CalldataBlock | undefined;
    getRawData(): Buffer;
}
//# sourceMappingURL=pointer.d.ts.map