/// <reference types="node" />
import { AbiEncoder } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { BlockParam, CallData, ConstructorAbi, ContractAbi, DataItem, MethodAbi, SupportedProvider, TransactionReceiptWithDecodedLogs, TxData, TxDataPayable } from 'ethereum-types';
export { linkLibrariesInBytecode, methodAbiToFunctionSignature } from './utils';
import { AwaitTransactionSuccessOpts } from './types';
export { SubscriptionManager } from './subscription_manager';
export { ContractEvent, SendTransactionOpts, AwaitTransactionSuccessOpts, ContractFunctionObj, ContractTxFunctionObj, SubscriptionErrors, } from './types';
export interface AbiEncoderByFunctionSignature {
    [key: string]: AbiEncoder.Method;
}
/**
 * @dev A promise-compatible type that exposes a `txHash` field.
 *      Not used by BaseContract, but generated contracts will return it in
 *      `awaitTransactionSuccessAsync()`.
 *      Maybe there's a better place for this.
 */
export declare class PromiseWithTransactionHash<T> implements Promise<T> {
    readonly txHashPromise: Promise<string>;
    private readonly _promise;
    constructor(txHashPromise: Promise<string>, promise: Promise<T>);
    then<TResult>(onFulfilled?: (v: T) => TResult | Promise<TResult>, onRejected?: (reason: any) => Promise<never>): Promise<TResult>;
    catch<TResult>(onRejected?: (reason: any) => Promise<TResult>): Promise<TResult | T>;
    finally(onFinally?: (() => void) | null): Promise<T>;
    get [Symbol.toStringTag](): string;
}
export interface EncoderOverrides {
    encodeInput: (functionName: string, values: any) => string;
    decodeOutput: (functionName: string, data: string) => any;
}
export declare class BaseContract {
    protected _abiEncoderByFunctionSignature: AbiEncoderByFunctionSignature;
    protected _web3Wrapper: Web3Wrapper;
    protected _encoderOverrides: Partial<EncoderOverrides>;
    abi: ContractAbi;
    address: string;
    contractName: string;
    constructorArgs: any[];
    _deployedBytecodeIfExists?: Buffer;
    private _evmIfExists?;
    private _evmAccountIfExists?;
    protected static _formatABIDataItemList(abis: DataItem[], values: any[], formatter: (type: string, value: any) => any): any;
    protected static _lowercaseAddress(type: string, value: string): string;
    protected static _bigNumberToString(_type: string, value: any): any;
    protected static _lookupConstructorAbi(abi: ContractAbi): ConstructorAbi;
    protected static _throwIfCallResultIsRevertError(rawCallResult: string): void;
    protected static _throwIfThrownErrorIsRevertError(error: Error): void;
    protected static _throwIfUnexpectedEmptyCallResult(rawCallResult: string, methodAbi: AbiEncoder.Method): void;
    static strictArgumentEncodingCheck(inputAbi: DataItem[], args: any[]): string;
    protected static _applyDefaultsToContractTxDataAsync<T extends Partial<TxData | TxDataPayable>>(txData: T, estimateGasAsync?: (txData: T) => Promise<number>): Promise<TxData>;
    protected static _assertCallParams(callData: Partial<CallData>, defaultBlock?: BlockParam): void;
    private static _removeUndefinedProperties;
    protected _promiseWithTransactionHash(txHashPromise: Promise<string>, opts: AwaitTransactionSuccessOpts): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs>;
    protected _applyDefaultsToTxDataAsync<T extends Partial<TxData | TxDataPayable>>(txData: T, estimateGasAsync?: (txData: T) => Promise<number>): Promise<TxData>;
    protected _evmExecAsync(encodedData: string): Promise<string>;
    protected _performCallAsync(callData: Partial<CallData>, defaultBlock?: BlockParam): Promise<string>;
    protected _lookupAbiEncoder(functionSignature: string): AbiEncoder.Method;
    protected _lookupAbi(functionSignature: string): MethodAbi;
    protected _strictEncodeArguments(functionSignature: string, functionArguments: any): string;
    constructor(contractName: string, abi: ContractAbi, address: string, supportedProvider: SupportedProvider, callAndTxnDefaults?: Partial<CallData>, logDecodeDependencies?: {
        [contractName: string]: ContractAbi;
    }, deployedBytecode?: string, encoderOverrides?: Partial<EncoderOverrides>);
}
//# sourceMappingURL=index.d.ts.map