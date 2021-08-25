/// <reference types="node" />
import { DataItem } from 'ethereum-types';
import { DataTypeFactory } from '../abstract_data_types/interfaces';
import { AbstractBlobDataType } from '../abstract_data_types/types/blob';
import { RawCalldata } from '../calldata/raw_calldata';
export declare class BoolDataType extends AbstractBlobDataType {
    private static readonly _SIZE_KNOWN_AT_COMPILE_TIME;
    private static readonly _DEFAULT_VALUE;
    static matchType(type: string): boolean;
    constructor(dataItem: DataItem, dataTypeFactory: DataTypeFactory);
    encodeValue(value: boolean): Buffer;
    decodeValue(calldata: RawCalldata): boolean;
    getDefaultValue(): boolean;
    getSignatureType(): string;
}
//# sourceMappingURL=bool.d.ts.map