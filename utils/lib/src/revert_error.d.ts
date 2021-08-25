/// <reference types="node" />
import { ObjectMap } from '@0x/types';
import { DataItem, RevertErrorAbi } from 'ethereum-types';
import { BigNumber } from './configured_bignumber';
declare type ArgTypes = string | BigNumber | number | boolean | RevertError | BigNumber[] | string[] | number[] | boolean[] | Array<BigNumber | number | string>;
declare type ValueMap = ObjectMap<ArgTypes | undefined>;
interface RevertErrorType {
    new (): RevertError;
}
/**
 * Register a RevertError type so that it can be decoded by
 * `decodeRevertError`.
 * @param revertClass A class that inherits from RevertError.
 * @param force Allow overwriting registered types.
 */
export declare function registerRevertErrorType(revertClass: RevertErrorType, force?: boolean): void;
/**
 * Decode an ABI encoded revert error.
 * Throws if the data cannot be decoded as a known RevertError type.
 * @param bytes The ABI encoded revert error. Either a hex string or a Buffer.
 * @param coerce Coerce unknown selectors into a `RawRevertError` type.
 * @return A RevertError object.
 */
export declare function decodeBytesAsRevertError(bytes: string | Buffer, coerce?: boolean): RevertError;
/**
 * Decode a thrown error.
 * Throws if the data cannot be decoded as a known RevertError type.
 * @param error Any thrown error.
 * @param coerce Coerce unknown selectors into a `RawRevertError` type.
 * @return A RevertError object.
 */
export declare function decodeThrownErrorAsRevertError(error: Error, coerce?: boolean): RevertError;
/**
 * Coerce a thrown error into a `RevertError`. Always succeeds.
 * @param error Any thrown error.
 * @return A RevertError object.
 */
export declare function coerceThrownErrorAsRevertError(error: Error): RevertError;
/**
 * Base type for revert errors.
 */
export declare abstract class RevertError extends Error {
    private static readonly _typeRegistry;
    readonly abi?: RevertErrorAbi;
    readonly values: ValueMap;
    protected readonly _raw?: string;
    /**
     * Decode an ABI encoded revert error.
     * Throws if the data cannot be decoded as a known RevertError type.
     * @param bytes The ABI encoded revert error. Either a hex string or a Buffer.
     * @param coerce Whether to coerce unknown selectors into a `RawRevertError` type.
     * @return A RevertError object.
     */
    static decode(bytes: string | Buffer | RevertError, coerce?: boolean): RevertError;
    /**
     * Register a RevertError type so that it can be decoded by
     * `RevertError.decode`.
     * @param revertClass A class that inherits from RevertError.
     * @param force Allow overwriting existing registrations.
     */
    static registerType(revertClass: RevertErrorType, force?: boolean): void;
    /**
     * Create a RevertError instance with optional parameter values.
     * Parameters that are left undefined will not be tested in equality checks.
     * @param declaration Function-style declaration of the revert (e.g., Error(string message))
     * @param values Optional mapping of parameters to values.
     * @param raw Optional encoded form of the revert error. If supplied, this
     *        instance will be treated as a `RawRevertError`, meaning it can only
     *        match other `RawRevertError` types with the same encoded payload.
     */
    protected constructor(name: string, declaration?: string, values?: ValueMap, raw?: string);
    /**
     * Get the ABI name for this revert.
     */
    get name(): string;
    /**
     * Get the class name of this type.
     */
    get typeName(): string;
    /**
     * Get the hex selector for this revert (without leading '0x').
     */
    get selector(): string;
    /**
     * Get the signature for this revert: e.g., 'Error(string)'.
     */
    get signature(): string;
    /**
     * Get the ABI arguments for this revert.
     */
    get arguments(): DataItem[];
    get [Symbol.toStringTag](): string;
    /**
     * Compares this instance with another.
     * Fails if instances are not of the same type.
     * Only fields/values defined in both instances are compared.
     * @param other Either another RevertError instance, hex-encoded bytes, or a Buffer of the ABI encoded revert.
     * @return True if both instances match.
     */
    equals(other: RevertError | Buffer | string): boolean;
    encode(): string;
    toString(): string;
    private _getArgumentByName;
    private get _isAnyType();
    private get _isRawType();
    private get _hasAllArgumentValues();
}
interface GanacheTransactionRevertResult {
    error: 'revert';
    program_counter: number;
    return?: string;
    reason?: string;
}
interface GanacheTransactionRevertError extends Error {
    results: {
        [hash: string]: GanacheTransactionRevertResult;
    };
    hashes: string[];
}
interface ParityTransactionRevertError extends Error {
    code: number;
    data: string;
    message: string;
}
/**
 * Try to extract the ecnoded revert error bytes from a thrown `Error`.
 */
export declare function getThrownErrorRevertErrorBytes(error: Error | GanacheTransactionRevertError | ParityTransactionRevertError): string;
/**
 * RevertError type for standard string reverts.
 */
export declare class StringRevertError extends RevertError {
    constructor(message?: string);
}
/**
 * Special RevertError type that matches with any other RevertError instance.
 */
export declare class AnyRevertError extends RevertError {
    constructor();
}
/**
 * Special RevertError type that is not decoded.
 */
export declare class RawRevertError extends RevertError {
    constructor(encoded: string | Buffer);
}
export {};
//# sourceMappingURL=revert_error.d.ts.map