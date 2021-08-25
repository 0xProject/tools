/// <reference types="node" />
import { CalldataBlock } from '../calldata_block';
export declare class BlobCalldataBlock extends CalldataBlock {
    private readonly _blob;
    constructor(name: string, signature: string, parentName: string, blob: Buffer);
    toBuffer(): Buffer;
    getRawData(): Buffer;
}
//# sourceMappingURL=blob.d.ts.map