import { EncoderOverrides, ContractFunctionObj, ContractTxFunctionObj, BaseContract } from '@0x/base-contract';
import { BlockRange, ContractAbi, ContractArtifact, DecodedLogArgs, LogWithDecodedArgs, TxData, SupportedProvider } from 'ethereum-types';
import { BigNumber } from '@0x/utils';
import { EventCallback, IndexedFilterValues, SimpleContractArtifact } from '@0x/types';
import { Web3Wrapper } from '@0x/web3-wrapper';
export declare type AbiGenDummyEventArgs = AbiGenDummySimpleEventEventArgs | AbiGenDummyWithdrawalEventArgs;
export declare enum AbiGenDummyEvents {
    SimpleEvent = "SimpleEvent",
    Withdrawal = "Withdrawal"
}
export interface AbiGenDummySimpleEventEventArgs extends DecodedLogArgs {
    someBytes: string;
    someString: string;
}
export interface AbiGenDummyWithdrawalEventArgs extends DecodedLogArgs {
    _owner: string;
    _value: BigNumber;
}
export declare class AbiGenDummyContract extends BaseContract {
    /**
     * @ignore
     */
    static deployedBytecode: string;
    static contractName: string;
    private readonly _methodABIIndex;
    private readonly _subscriptionManager;
    static deployFrom0xArtifactAsync(artifact: ContractArtifact | SimpleContractArtifact, supportedProvider: SupportedProvider, txDefaults: Partial<TxData>, logDecodeDependencies: {
        [contractName: string]: ContractArtifact | SimpleContractArtifact;
    }): Promise<AbiGenDummyContract>;
    static deployWithLibrariesFrom0xArtifactAsync(artifact: ContractArtifact, libraryArtifacts: {
        [libraryName: string]: ContractArtifact;
    }, supportedProvider: SupportedProvider, txDefaults: Partial<TxData>, logDecodeDependencies: {
        [contractName: string]: ContractArtifact | SimpleContractArtifact;
    }): Promise<AbiGenDummyContract>;
    static deployAsync(bytecode: string, abi: ContractAbi, supportedProvider: SupportedProvider, txDefaults: Partial<TxData>, logDecodeDependencies: {
        [contractName: string]: ContractAbi;
    }): Promise<AbiGenDummyContract>;
    /**
     * @returns      The contract ABI
     */
    static ABI(): ContractAbi;
    protected static _deployLibrariesAsync(artifact: ContractArtifact, libraryArtifacts: {
        [libraryName: string]: ContractArtifact;
    }, web3Wrapper: Web3Wrapper, txDefaults: Partial<TxData>, libraryAddresses?: {
        [libraryName: string]: string;
    }): Promise<{
        [libraryName: string]: string;
    }>;
    getFunctionSignature(methodName: string): string;
    getABIDecodedTransactionData<T>(methodName: string, callData: string): T;
    getABIDecodedReturnData<T>(methodName: string, callData: string): T;
    getSelector(methodName: string): string;
    /**
     * a method that accepts an array of bytes
     * @param a the array of bytes being accepted
     */
    acceptsAnArrayOfBytes(a: string[]): ContractFunctionObj<void>;
    acceptsBytes(a: string): ContractFunctionObj<void>;
    /**
     * Tests decoding when the input and output are complex.
     */
    complexInputComplexOutput(complexInput: {
        foo: BigNumber;
        bar: string;
        car: string;
    }): ContractFunctionObj<{
        input: {
            foo: BigNumber;
            bar: string;
            car: string;
        };
        lorem: string;
        ipsum: string;
        dolor: string;
    }>;
    /**
     * test that devdocs will be generated and
     * that multiline devdocs will look okay
     * @param hash description of some hash. Let's make this line super long to
     *     demonstrate hanging indents for method params. It has to be more than
     *     one hundred twenty columns.
     * @param v some v, recovery id
     * @param r ECDSA r output
     * @param s ECDSA s output
     * @returns the signerAddress that created this signature.  this line too is super long in order to demonstrate the proper hanging indentation in generated code.
     */
    ecrecoverFn(hash: string, v: number | BigNumber, r: string, s: string): ContractFunctionObj<string>;
    emitSimpleEvent(): ContractTxFunctionObj<void>;
    methodAcceptingArrayOfArrayOfStructs(index_0: Array<{
        someBytes: string;
        anInteger: number | BigNumber;
        aDynamicArrayOfBytes: string[];
        aString: string;
    }>[]): ContractFunctionObj<void>;
    methodAcceptingArrayOfStructs(index_0: Array<{
        someBytes: string;
        anInteger: number | BigNumber;
        aDynamicArrayOfBytes: string[];
        aString: string;
    }>): ContractFunctionObj<void>;
    methodReturningArrayOfStructs(): ContractFunctionObj<Array<{
        someBytes: string;
        anInteger: number;
        aDynamicArrayOfBytes: string[];
        aString: string;
    }>>;
    methodReturningMultipleValues(): ContractFunctionObj<[BigNumber, string]>;
    methodUsingNestedStructWithInnerStructNotUsedElsewhere(): ContractFunctionObj<{
        innerStruct: {
            aField: BigNumber;
        };
    }>;
    /**
     * Tests decoding when the input and output are complex and have more than one argument.
     */
    multiInputMultiOutput(index_0: BigNumber, index_1: string, index_2: string): ContractFunctionObj<[string, string, string]>;
    nestedStructInput(n: {
        innerStruct: {
            someBytes: string;
            anInteger: number | BigNumber;
            aDynamicArrayOfBytes: string[];
            aString: string;
        };
        description: string;
    }): ContractFunctionObj<void>;
    nestedStructOutput(): ContractFunctionObj<{
        innerStruct: {
            someBytes: string;
            anInteger: number;
            aDynamicArrayOfBytes: string[];
            aString: string;
        };
        description: string;
    }>;
    /**
     * Tests decoding when both input and output are empty.
     */
    noInputNoOutput(): ContractFunctionObj<void>;
    /**
     * Tests decoding when input is empty and output is non-empty.
     */
    noInputSimpleOutput(): ContractFunctionObj<BigNumber>;
    nonPureMethod(): ContractTxFunctionObj<BigNumber>;
    nonPureMethodThatReturnsNothing(): ContractTxFunctionObj<void>;
    overloadedMethod2(a: string): ContractFunctionObj<void>;
    overloadedMethod1(a: BigNumber): ContractFunctionObj<void>;
    pureFunctionWithConstant(): ContractFunctionObj<BigNumber>;
    requireWithConstant(): ContractFunctionObj<void>;
    revertWithConstant(): ContractFunctionObj<void>;
    /**
     * Tests decoding when input is not empty but output is empty.
     */
    simpleInputNoOutput(index_0: BigNumber): ContractFunctionObj<void>;
    /**
     * Tests decoding when both input and output are non-empty.
     */
    simpleInputSimpleOutput(index_0: BigNumber): ContractFunctionObj<BigNumber>;
    simplePureFunction(): ContractFunctionObj<BigNumber>;
    simplePureFunctionWithInput(x: BigNumber): ContractFunctionObj<BigNumber>;
    simpleRequire(): ContractFunctionObj<void>;
    simpleRevert(): ContractFunctionObj<void>;
    structInput(s: {
        someBytes: string;
        anInteger: number | BigNumber;
        aDynamicArrayOfBytes: string[];
        aString: string;
    }): ContractFunctionObj<void>;
    /**
     * a method that returns a struct
     * @returns a Struct struct
     */
    structOutput(): ContractFunctionObj<{
        someBytes: string;
        anInteger: number;
        aDynamicArrayOfBytes: string[];
        aString: string;
    }>;
    withAddressInput(x: string, a: BigNumber, b: BigNumber, y: string, c: BigNumber): ContractFunctionObj<string>;
    withdraw(wad: BigNumber): ContractTxFunctionObj<void>;
    /**
     * Subscribe to an event type emitted by the AbiGenDummy contract.
     * @param eventName The AbiGenDummy contract event you would like to subscribe to.
     * @param indexFilterValues An object where the keys are indexed args returned by the event and
     * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
     * @param callback Callback that gets called when a log is added/removed
     * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
     * @return Subscription token used later to unsubscribe
     */
    subscribe<ArgsType extends AbiGenDummyEventArgs>(eventName: AbiGenDummyEvents, indexFilterValues: IndexedFilterValues, callback: EventCallback<ArgsType>, isVerbose?: boolean, blockPollingIntervalMs?: number): string;
    /**
     * Cancel a subscription
     * @param subscriptionToken Subscription token returned by `subscribe()`
     */
    unsubscribe(subscriptionToken: string): void;
    /**
     * Cancels all existing subscriptions
     */
    unsubscribeAll(): void;
    /**
     * Gets historical logs without creating a subscription
     * @param eventName The AbiGenDummy contract event you would like to subscribe to.
     * @param blockRange Block range to get logs from.
     * @param indexFilterValues An object where the keys are indexed args returned by the event and
     * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
     * @return Array of logs that match the parameters
     */
    getLogsAsync<ArgsType extends AbiGenDummyEventArgs>(eventName: AbiGenDummyEvents, blockRange: BlockRange, indexFilterValues: IndexedFilterValues): Promise<Array<LogWithDecodedArgs<ArgsType>>>;
    constructor(address: string, supportedProvider: SupportedProvider, txDefaults?: Partial<TxData>, logDecodeDependencies?: {
        [contractName: string]: ContractAbi;
    }, deployedBytecode?: string | undefined, encoderOverrides?: Partial<EncoderOverrides>);
}
//# sourceMappingURL=abi_gen_dummy.d.ts.map