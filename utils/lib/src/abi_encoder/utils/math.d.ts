/// <reference types="node" />
import { BigNumber } from '../../configured_bignumber';
/**
 * Takes a numeric value and returns its ABI-encoded value
 * @param value_    The value to encode.
 * @return ABI Encoded value
 */
export declare function encodeNumericValue(value_: BigNumber | string | number): Buffer;
/**
 * Takes a numeric value and returns its ABI-encoded value.
 * Performs an additional sanity check, given the min/max allowed value.
 * @param value_    The value to encode.
 * @return ABI Encoded value
 */
export declare function safeEncodeNumericValue(value: BigNumber | string | number, minValue: BigNumber, maxValue: BigNumber): Buffer;
/**
 * Takes an ABI-encoded numeric value and returns its decoded value as a BigNumber.
 * @param encodedValue    The encoded numeric value.
 * @param minValue        The minimum possible decoded value.
 * @return ABI Decoded value
 */
export declare function decodeNumericValue(encodedValue: Buffer, minValue: BigNumber): BigNumber;
/**
 * Takes an ABI-encoded numeric value and returns its decoded value as a BigNumber.
 * Performs an additional sanity check, given the min/max allowed value.
 * @param encodedValue    The encoded numeric value.
 * @param minValue        The minimum possible decoded value.
 * @return ABI Decoded value
 */
export declare function safeDecodeNumericValue(encodedValue: Buffer, minValue: BigNumber, maxValue: BigNumber): BigNumber;
//# sourceMappingURL=math.d.ts.map