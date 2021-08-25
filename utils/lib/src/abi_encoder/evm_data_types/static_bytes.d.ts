/// <reference types="node" />
import { DataItem } from 'ethereum-types';
import { DataTypeFactory } from '../abstract_data_types/interfaces';
import { AbstractBlobDataType } from '../abstract_data_types/types/blob';
import { RawCalldata } from '../calldata/raw_calldata';
export declare class StaticBytesDataType extends AbstractBlobDataType {
    private static readonly _SIZE_KNOWN_AT_COMPILE_TIME;
    private static readonly _MATCHER;
    private static readonly _DEFAULT_WIDTH;
    private readonly _width;
    static matchType(type: string): boolean;
    private static _decodeWidthFromType;
    constructor(dataItem: DataItem, dataTypeFactory: DataTypeFactory);
    getSignatureType(): string;
    encodeValue(value: string | Buffer): Buffer;
    decodeValue(calldata: RawCalldata): string;
    getDefaultValue(): string;
    private _sanityCheckValue;
}
//# sourceMappingURL=static_bytes.d.ts.map