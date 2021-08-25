/// <reference types="node" />
import { DataItem } from 'ethereum-types';
import { BlobCalldataBlock } from '../../calldata/blocks/blob';
import { CalldataBlock } from '../../calldata/calldata_block';
import { RawCalldata } from '../../calldata/raw_calldata';
import { DecodingRules } from '../../utils/rules';
import { DataType } from '../data_type';
import { DataTypeFactory } from '../interfaces';
export declare abstract class AbstractBlobDataType extends DataType {
    protected _sizeKnownAtCompileTime: boolean;
    constructor(dataItem: DataItem, factory: DataTypeFactory, sizeKnownAtCompileTime: boolean);
    generateCalldataBlock(value: any, parentBlock?: CalldataBlock): BlobCalldataBlock;
    generateValue(calldata: RawCalldata, rules: DecodingRules): any;
    isStatic(): boolean;
    abstract encodeValue(value: any): Buffer;
    abstract decodeValue(calldata: RawCalldata): any;
}
//# sourceMappingURL=blob.d.ts.map