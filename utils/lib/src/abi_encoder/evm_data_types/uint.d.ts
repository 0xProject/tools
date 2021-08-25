/// <reference types="node" />
import { DataItem } from 'ethereum-types';
import { BigNumber } from '../../configured_bignumber';
import { DataTypeFactory } from '../abstract_data_types/interfaces';
import { AbstractBlobDataType } from '../abstract_data_types/types/blob';
import { RawCalldata } from '../calldata/raw_calldata';
export declare class UIntDataType extends AbstractBlobDataType {
    private static readonly _MATCHER;
    private static readonly _SIZE_KNOWN_AT_COMPILE_TIME;
    private static readonly _MAX_WIDTH;
    private static readonly _DEFAULT_WIDTH;
    private static readonly _MIN_VALUE;
    private static readonly _DEFAULT_VALUE;
    private static readonly _WIDTH_TO_MAX_VALUE;
    private readonly _width;
    private readonly _maxValue;
    static matchType(type: string): boolean;
    private static _decodeWidthFromType;
    constructor(dataItem: DataItem, dataTypeFactory: DataTypeFactory);
    encodeValue(value: BigNumber | string | number): Buffer;
    decodeValue(calldata: RawCalldata): BigNumber | number;
    getDefaultValue(): BigNumber | number;
    getSignatureType(): string;
}
//# sourceMappingURL=uint.d.ts.map