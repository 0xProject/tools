import { AbiDecoder, BigNumber } from '@0x/utils';
import { BlockParam, BlockWithoutTransactionData, BlockWithTransactionData, CallData, FilterObject, JSONRPCRequestPayload, LogEntry, SupportedProvider, TraceParams, Transaction, TransactionReceipt, TransactionReceiptWithDecodedLogs, TransactionTrace, TxAccessListWithGas, TxData } from 'ethereum-types';
import { NodeType } from './types';
/**
 * An alternative to the Web3.js library that provides a consistent, clean, promise-based interface.
 */
export declare class Web3Wrapper {
    /**
     * Flag to check if this instance is of type Web3Wrapper
     */
    isZeroExWeb3Wrapper: boolean;
    abiDecoder: AbiDecoder;
    private _provider;
    private readonly _supportedProvider;
    private readonly _callAndTxnDefaults;
    private _jsonRpcRequestId;
    /**
     * Check if an address is a valid Ethereum address
     * @param address Address to check
     * @returns Whether the address is a valid Ethereum address
     */
    static isAddress(address: string): boolean;
    /**
     * A unit amount is defined as the amount of a token above the specified decimal places (integer part).
     * E.g: If a currency has 18 decimal places, 1e18 or one quintillion of the currency is equivalent
     * to 1 unit.
     * @param   amount      The amount in baseUnits that you would like converted to units.
     * @param   decimals    The number of decimal places the unit amount has.
     * @return  The amount in units.
     */
    static toUnitAmount(amount: BigNumber, decimals: number): BigNumber;
    /**
     * A baseUnit is defined as the smallest denomination of a token. An amount expressed in baseUnits
     * is the amount expressed in the smallest denomination.
     * E.g: 1 unit of a token with 18 decimal places is expressed in baseUnits as 1000000000000000000
     * @param   amount      The amount of units that you would like converted to baseUnits.
     * @param   decimals    The number of decimal places the unit amount has.
     * @return  The amount in baseUnits.
     */
    static toBaseUnitAmount(amount: BigNumber | number, decimals: number): BigNumber;
    /**
     * Convert an Ether amount from ETH to Wei
     * @param ethAmount Amount of Ether to convert to wei
     * @returns Amount in wei
     */
    static toWei(ethAmount: BigNumber): BigNumber;
    private static _assertBlockParam;
    private static _assertBlockParamOrString;
    private static _normalizeTxReceiptStatus;
    /**
     * Instantiates a new Web3Wrapper.
     * @param   provider    The Web3 provider instance you would like the Web3Wrapper to use for interacting with
     *                      the backing Ethereum node.
     * @param   callAndTxnDefaults  Override Call and Txn Data defaults sent with RPC requests to the backing Ethereum node.
     * @return  An instance of the Web3Wrapper class.
     */
    constructor(supportedProvider: SupportedProvider, callAndTxnDefaults?: Partial<CallData>);
    /**
     * Get the contract defaults set to the Web3Wrapper instance
     * @return  CallAndTxnData defaults (e.g gas, gasPrice, nonce, etc...)
     */
    getContractDefaults(): Partial<CallData> | undefined;
    /**
     * Retrieve the Web3 provider
     * @return  Web3 provider instance
     */
    getProvider(): SupportedProvider;
    /**
     * Update the used Web3 provider
     * @param provider The new Web3 provider to be set
     */
    setProvider(supportedProvider: SupportedProvider): void;
    /**
     * Check whether an address is available through the backing provider. This can be
     * useful if you want to know whether a user can sign messages or transactions from
     * a given Ethereum address.
     * @param senderAddress Address to check availability for
     * @returns Whether the address is available through the provider.
     */
    isSenderAddressAvailableAsync(senderAddress: string): Promise<boolean>;
    /**
     * Fetch the backing Ethereum node's version string (e.g `MetaMask/v4.2.0`)
     * @returns Ethereum node's version string
     */
    getNodeVersionAsync(): Promise<string>;
    /**
     * Fetches the networkId of the backing Ethereum node
     * @returns The network id
     */
    getNetworkIdAsync(): Promise<number>;
    /**
     * Fetches the chainId of the backing Ethereum node
     * @returns The chain id
     */
    getChainIdAsync(): Promise<number>;
    /**
     * Retrieves the transaction receipt for a given transaction hash if found
     * @param txHash Transaction hash
     * @returns The transaction receipt, including it's status (0: failed, 1: succeeded). Returns undefined if transaction not found.
     */
    getTransactionReceiptIfExistsAsync(txHash: string): Promise<TransactionReceipt | undefined>;
    /**
     * Retrieves the transaction data for a given transaction
     * @param txHash Transaction hash
     * @returns The raw transaction data
     */
    getTransactionByHashAsync(txHash: string): Promise<Transaction>;
    /**
     * Retrieves an accounts Ether balance in wei
     * @param owner Account whose balance you wish to check
     * @param defaultBlock The block depth at which to fetch the balance (default=latest)
     * @returns Balance in wei
     */
    getBalanceInWeiAsync(owner: string, defaultBlock?: BlockParam): Promise<BigNumber>;
    /**
     * Check if a contract exists at a given address
     * @param address Address to which to check
     * @returns Whether or not contract code was found at the supplied address
     */
    doesContractExistAtAddressAsync(address: string): Promise<boolean>;
    /**
     * Gets the contract code by address
     * @param  address Address of the contract
     * @param defaultBlock Block height at which to make the call. Defaults to `latest`
     * @return Code of the contract
     */
    getContractCodeAsync(address: string, defaultBlock?: BlockParam): Promise<string>;
    /**
     * Gets the debug trace of a transaction
     * @param  txHash Hash of the transactuon to get a trace for
     * @param  traceParams Config object allowing you to specify if you need memory/storage/stack traces.
     * @return Transaction trace
     */
    getTransactionTraceAsync(txHash: string, traceParams: TraceParams): Promise<TransactionTrace>;
    /**
     * Sign a message with a specific address's private key (`eth_sign`)
     * @param address Address of signer
     * @param message Message to sign
     * @returns Signature string (might be VRS or RSV depending on the Signer)
     */
    signMessageAsync(address: string, message: string): Promise<string>;
    /**
     * Sign an EIP712 typed data message with a specific address's private key (`eth_signTypedData`)
     * @param address Address of signer
     * @param typedData Typed data message to sign
     * @returns Signature string (as RSV)
     */
    signTypedDataAsync(address: string, typedData: any): Promise<string>;
    /**
     * Fetches the latest block number
     * @returns Block number
     */
    getBlockNumberAsync(): Promise<number>;
    /**
     * Fetches the nonce for an account (transaction count for EOAs).
     * @param address Address of account.
     * @param defaultBlock Block height at which to make the call. Defaults to `latest`
     * @returns Account nonce.
     */
    getAccountNonceAsync(address: string, defaultBlock?: BlockParam): Promise<number>;
    /**
     * Fetch a specific Ethereum block without transaction data
     * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
     * @returns The requested block without transaction data, or undefined if block was not found
     * (e.g the node isn't fully synced, there was a block re-org and the requested block was uncles, etc...)
     */
    getBlockIfExistsAsync(blockParam: string | BlockParam): Promise<BlockWithoutTransactionData | undefined>;
    /**
     * Fetch a specific Ethereum block with transaction data
     * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
     * @returns The requested block with transaction data
     */
    getBlockWithTransactionDataAsync(blockParam: string | BlockParam): Promise<BlockWithTransactionData>;
    /**
     * Fetch a block's timestamp
     * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
     * @returns The block's timestamp
     */
    getBlockTimestampAsync(blockParam: string | BlockParam): Promise<number>;
    /**
     * Retrieve the user addresses available through the backing provider
     * @returns Available user addresses
     */
    getAvailableAddressesAsync(): Promise<string[]>;
    /**
     * Take a snapshot of the blockchain state on a TestRPC/Ganache local node
     * @returns The snapshot id. This can be used to revert to this snapshot
     */
    takeSnapshotAsync(): Promise<number>;
    /**
     * Revert the blockchain state to a previous snapshot state on TestRPC/Ganache local node
     * @param snapshotId snapshot id to revert to
     * @returns Whether the revert was successful
     */
    revertSnapshotAsync(snapshotId: number): Promise<boolean>;
    /**
     * Mine a block on a TestRPC/Ganache local node
     */
    mineBlockAsync(): Promise<void>;
    /**
     * Increase the next blocks timestamp on TestRPC/Ganache or Geth local node.
     * Will throw if provider is neither TestRPC/Ganache or Geth.
     * @param timeDelta Amount of time to add in seconds
     */
    increaseTimeAsync(timeDelta: number): Promise<number>;
    /**
     * Retrieve smart contract logs for a given filter
     * @param filter Parameters by which to filter which logs to retrieve
     * @returns The corresponding log entries
     */
    getLogsAsync(filter: FilterObject): Promise<LogEntry[]>;
    /**
     * Calculate the estimated gas cost for a given transaction
     * @param txData Transaction data
     * @returns Estimated gas cost
     */
    estimateGasAsync(txData: Partial<TxData>): Promise<number>;
    /**
     * Generate an access list for an ethereum call and also compute the gas used.
     * @param callData Call data
     * @param defaultBlock Block height at which to make the call. Defaults to 'latest'.
     * @returns The access list and gas used.
     */
    createAccessListAsync(callData: CallData, defaultBlock?: BlockParam): Promise<TxAccessListWithGas>;
    /**
     * Call a smart contract method at a given block height
     * @param callData Call data
     * @param defaultBlock Block height at which to make the call. Defaults to `latest`
     * @returns The raw call result
     */
    callAsync(callData: CallData, defaultBlock?: BlockParam): Promise<string>;
    /**
     * Send a transaction
     * @param txData Transaction data
     * @returns Transaction hash
     */
    sendTransactionAsync(txData: TxData): Promise<string>;
    /**
     * Waits for a transaction to be mined and returns the transaction receipt.
     * Note that just because a transaction was mined does not mean it was
     * successful. You need to check the status code of the transaction receipt
     * to find out if it was successful, or use the helper method
     * awaitTransactionSuccessAsync.
     * @param   txHash            Transaction hash
     * @param   pollingIntervalMs How often (in ms) should we check if the transaction is mined.
     * @param   timeoutMs         How long (in ms) to poll for transaction mined until aborting.
     * @return  Transaction receipt with decoded log args.
     */
    awaitTransactionMinedAsync(txHash: string, pollingIntervalMs?: number, timeoutMs?: number): Promise<TransactionReceiptWithDecodedLogs>;
    /**
     * Waits for a transaction to be mined and returns the transaction receipt.
     * Unlike awaitTransactionMinedAsync, it will throw if the receipt has a
     * status that is not equal to 1. A status of 0 or null indicates that the
     * transaction was mined, but failed. See:
     * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
     * @param   txHash            Transaction hash
     * @param   pollingIntervalMs How often (in ms) should we check if the transaction is mined.
     * @param   timeoutMs         How long (in ms) to poll for transaction mined until aborting.
     * @return  Transaction receipt with decoded log args.
     */
    awaitTransactionSuccessAsync(txHash: string, pollingIntervalMs?: number, timeoutMs?: number): Promise<TransactionReceiptWithDecodedLogs>;
    /**
     * Calls the 'debug_setHead' JSON RPC method, which sets the current head of
     * the local chain by block number. Note, this is a destructive action and
     * may severely damage your chain. Use with extreme caution. As of now, this
     * is only supported by Geth. It sill throw if the 'debug_setHead' method is
     * not supported.
     * @param  blockNumber The block number to reset to.
     */
    setHeadAsync(blockNumber: number): Promise<void>;
    /**
     * Sends a raw Ethereum JSON RPC payload and returns the response's `result` key
     * @param payload A partial JSON RPC payload. No need to include version, id, params (if none needed)
     * @return The contents nested under the result key of the response body
     */
    sendRawPayloadAsync<A>(payload: Partial<JSONRPCRequestPayload>): Promise<A>;
    /**
     * Returns either NodeType.Geth or NodeType.Ganache depending on the type of
     * the backing Ethereum node. Throws for any other type of node.
     */
    getNodeTypeAsync(): Promise<NodeType>;
}
//# sourceMappingURL=web3_wrapper.d.ts.map