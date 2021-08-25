/// <reference types="node" />
import { DataItem } from 'ethereum-types';
import { DataTypeFactory } from '../abstract_data_types/interfaces';
import { AbstractBlobDataType } from '../abstract_data_types/types/blob';
import { RawCalldata } from '../calldata/raw_calldata';
export declare class DynamicBytesDataType extends AbstractBlobDataType {
    private static readonly _SIZE_KNOWN_AT_COMPILE_TIME;
    private static readonly _DEFAULT_VALUE;
    static matchType(type: string): boolean;
    private static _sanityCheckValue;
    constructor(dataItem: DataItem, dataTypeFactory: DataTypeFactory);
    encodeValue(value: string | Buffer): Buffer;
    decodeValue(calldata: RawCalldata): string;
    getDefaultValue(): string;
    getSignatureType(): string;
}
//# sourceMappingURL=dynamic_bytes.d.ts.map