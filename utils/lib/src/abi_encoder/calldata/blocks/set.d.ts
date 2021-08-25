/// <reference types="node" />
import { CalldataBlock } from '../calldata_block';
export declare class SetCalldataBlock extends CalldataBlock {
    private _header;
    private _members;
    constructor(name: string, signature: string, parentName: string);
    getRawData(): Buffer;
    setMembers(members: CalldataBlock[]): void;
    setHeader(header: Buffer): void;
    toBuffer(): Buffer;
    getMembers(): CalldataBlock[];
}
//# sourceMappingURL=set.d.ts.map