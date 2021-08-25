"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Wrapper = void 0;
const assert_1 = require("@0x/assert");
const json_schemas_1 = require("@0x/json-schemas");
const utils_1 = require("@0x/utils");
const ethereum_types_1 = require("ethereum-types");
const _ = require("lodash");
const marshaller_1 = require("./marshaller");
const types_1 = require("./types");
const utils_2 = require("./utils");
const BASE_TEN = 10;
// These are unique identifiers contained in the response of the
// web3_clientVersion call.
const uniqueVersionIds = {
    geth: 'Geth',
    ganache: 'EthereumJS TestRPC',
};
/**
 * An alternative to the Web3.js library that provides a consistent, clean, promise-based interface.
 */
class Web3Wrapper {
    /**
     * Instantiates a new Web3Wrapper.
     * @param   provider    The Web3 provider instance you would like the Web3Wrapper to use for interacting with
     *                      the backing Ethereum node.
     * @param   callAndTxnDefaults  Override Call and Txn Data defaults sent with RPC requests to the backing Ethereum node.
     * @return  An instance of the Web3Wrapper class.
     */
    constructor(supportedProvider, callAndTxnDefaults = {}) {
        /**
         * Flag to check if this instance is of type Web3Wrapper
         */
        this.isZeroExWeb3Wrapper = true;
        this.abiDecoder = new utils_1.AbiDecoder([]);
        this._supportedProvider = supportedProvider;
        this._provider = utils_1.providerUtils.standardizeOrThrow(supportedProvider);
        this._callAndTxnDefaults = callAndTxnDefaults;
        this._jsonRpcRequestId = 1;
    }
    /**
     * Check if an address is a valid Ethereum address
     * @param address Address to check
     * @returns Whether the address is a valid Ethereum address
     */
    static isAddress(address) {
        return utils_1.addressUtils.isAddress(address);
    }
    /**
     * A unit amount is defined as the amount of a token above the specified decimal places (integer part).
     * E.g: If a currency has 18 decimal places, 1e18 or one quintillion of the currency is equivalent
     * to 1 unit.
     * @param   amount      The amount in baseUnits that you would like converted to units.
     * @param   decimals    The number of decimal places the unit amount has.
     * @return  The amount in units.
     */
    static toUnitAmount(amount, decimals) {
        assert_1.assert.isValidBaseUnitAmount('amount', amount);
        assert_1.assert.isNumber('decimals', decimals);
        const aUnit = new utils_1.BigNumber(BASE_TEN).pow(decimals);
        const unit = amount.div(aUnit);
        return unit;
    }
    /**
     * A baseUnit is defined as the smallest denomination of a token. An amount expressed in baseUnits
     * is the amount expressed in the smallest denomination.
     * E.g: 1 unit of a token with 18 decimal places is expressed in baseUnits as 1000000000000000000
     * @param   amount      The amount of units that you would like converted to baseUnits.
     * @param   decimals    The number of decimal places the unit amount has.
     * @return  The amount in baseUnits.
     */
    static toBaseUnitAmount(amount, decimals) {
        assert_1.assert.isNumber('decimals', decimals);
        const unit = new utils_1.BigNumber(BASE_TEN).pow(decimals);
        const baseUnitAmount = unit.times(amount);
        const hasDecimals = baseUnitAmount.decimalPlaces() !== 0;
        if (hasDecimals) {
            throw new Error(`Invalid unit amount: ${amount.toString(BASE_TEN)} - Too many decimal places`);
        }
        return baseUnitAmount;
    }
    /**
     * Convert an Ether amount from ETH to Wei
     * @param ethAmount Amount of Ether to convert to wei
     * @returns Amount in wei
     */
    static toWei(ethAmount) {
        assert_1.assert.isBigNumber('ethAmount', ethAmount);
        const ETH_DECIMALS = 18;
        const balanceWei = Web3Wrapper.toBaseUnitAmount(ethAmount, ETH_DECIMALS);
        return balanceWei;
    }
    static _assertBlockParam(blockParam) {
        if (_.isNumber(blockParam)) {
            return;
        }
        else if (_.isString(blockParam)) {
            assert_1.assert.doesBelongToStringEnum('blockParam', blockParam, ethereum_types_1.BlockParamLiteral);
        }
    }
    static _assertBlockParamOrString(blockParam) {
        try {
            Web3Wrapper._assertBlockParam(blockParam);
        }
        catch (err) {
            try {
                assert_1.assert.isHexString('blockParam', blockParam);
                return;
            }
            catch (err) {
                throw new Error(`Expected blockParam to be of type "string | BlockParam", encountered ${blockParam}`);
            }
        }
    }
    static _normalizeTxReceiptStatus(status) {
        // Transaction status might have four values
        // undefined - Testrpc and other old clients
        // null - New clients on old transactions
        // number - Parity
        // hex - Geth
        if (_.isString(status)) {
            return utils_2.utils.convertHexToNumber(status);
        }
        else if (status === undefined) {
            return null;
        }
        else {
            return status;
        }
    }
    /**
     * Get the contract defaults set to the Web3Wrapper instance
     * @return  CallAndTxnData defaults (e.g gas, gasPrice, nonce, etc...)
     */
    getContractDefaults() {
        return this._callAndTxnDefaults;
    }
    /**
     * Retrieve the Web3 provider
     * @return  Web3 provider instance
     */
    getProvider() {
        return this._supportedProvider;
    }
    /**
     * Update the used Web3 provider
     * @param provider The new Web3 provider to be set
     */
    setProvider(supportedProvider) {
        const provider = utils_1.providerUtils.standardizeOrThrow(supportedProvider);
        this._provider = provider;
    }
    /**
     * Check whether an address is available through the backing provider. This can be
     * useful if you want to know whether a user can sign messages or transactions from
     * a given Ethereum address.
     * @param senderAddress Address to check availability for
     * @returns Whether the address is available through the provider.
     */
    isSenderAddressAvailableAsync(senderAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isETHAddressHex('senderAddress', senderAddress);
            const addresses = yield this.getAvailableAddressesAsync();
            const normalizedAddress = senderAddress.toLowerCase();
            return _.includes(addresses, normalizedAddress);
        });
    }
    /**
     * Fetch the backing Ethereum node's version string (e.g `MetaMask/v4.2.0`)
     * @returns Ethereum node's version string
     */
    getNodeVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeVersion = yield this.sendRawPayloadAsync({ method: 'web3_clientVersion' });
            return nodeVersion;
        });
    }
    /**
     * Fetches the networkId of the backing Ethereum node
     * @returns The network id
     */
    getNetworkIdAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const networkIdStr = yield this.sendRawPayloadAsync({ method: 'net_version' });
            const networkId = _.parseInt(networkIdStr);
            return networkId;
        });
    }
    /**
     * Fetches the chainId of the backing Ethereum node
     * @returns The chain id
     */
    getChainIdAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const chainIdStr = yield this.sendRawPayloadAsync({ method: 'eth_chainId' });
            const chainId = _.parseInt(chainIdStr);
            return chainId;
        });
    }
    /**
     * Retrieves the transaction receipt for a given transaction hash if found
     * @param txHash Transaction hash
     * @returns The transaction receipt, including it's status (0: failed, 1: succeeded). Returns undefined if transaction not found.
     */
    getTransactionReceiptIfExistsAsync(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isHexString('txHash', txHash);
            const transactionReceiptRpc = yield this.sendRawPayloadAsync({
                method: 'eth_getTransactionReceipt',
                params: [txHash],
            });
            // HACK Parity can return a pending transaction receipt. We check for a non null
            // block number before continuing with returning a fully realised receipt.
            // ref: https://github.com/paritytech/parity-ethereum/issues/1180
            if (transactionReceiptRpc !== null && transactionReceiptRpc.blockNumber !== null) {
                transactionReceiptRpc.status = Web3Wrapper._normalizeTxReceiptStatus(transactionReceiptRpc.status);
                const transactionReceipt = marshaller_1.marshaller.unmarshalTransactionReceipt(transactionReceiptRpc);
                return transactionReceipt;
            }
            else {
                return undefined;
            }
        });
    }
    /**
     * Retrieves the transaction data for a given transaction
     * @param txHash Transaction hash
     * @returns The raw transaction data
     */
    getTransactionByHashAsync(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isHexString('txHash', txHash);
            const transactionRpc = yield this.sendRawPayloadAsync({
                method: 'eth_getTransactionByHash',
                params: [txHash],
            });
            const transaction = marshaller_1.marshaller.unmarshalTransaction(transactionRpc);
            return transaction;
        });
    }
    /**
     * Retrieves an accounts Ether balance in wei
     * @param owner Account whose balance you wish to check
     * @param defaultBlock The block depth at which to fetch the balance (default=latest)
     * @returns Balance in wei
     */
    getBalanceInWeiAsync(owner, defaultBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isETHAddressHex('owner', owner);
            if (defaultBlock !== undefined) {
                Web3Wrapper._assertBlockParam(defaultBlock);
            }
            const marshalledDefaultBlock = marshaller_1.marshaller.marshalBlockParam(defaultBlock);
            const encodedOwner = marshaller_1.marshaller.marshalAddress(owner);
            const balanceInWei = yield this.sendRawPayloadAsync({
                method: 'eth_getBalance',
                params: [encodedOwner, marshalledDefaultBlock],
            });
            // Rewrap in a new BigNumber
            return new utils_1.BigNumber(balanceInWei);
        });
    }
    /**
     * Check if a contract exists at a given address
     * @param address Address to which to check
     * @returns Whether or not contract code was found at the supplied address
     */
    doesContractExistAtAddressAsync(address) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isETHAddressHex('address', address);
            const code = yield this.getContractCodeAsync(address);
            // Regex matches 0x0, 0x00, 0x in order to accommodate poorly implemented clients
            const isCodeEmpty = /^0x0{0,40}$/i.test(code);
            return !isCodeEmpty;
        });
    }
    /**
     * Gets the contract code by address
     * @param  address Address of the contract
     * @param defaultBlock Block height at which to make the call. Defaults to `latest`
     * @return Code of the contract
     */
    getContractCodeAsync(address, defaultBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isETHAddressHex('address', address);
            if (defaultBlock !== undefined) {
                Web3Wrapper._assertBlockParam(defaultBlock);
            }
            const marshalledDefaultBlock = marshaller_1.marshaller.marshalBlockParam(defaultBlock);
            const encodedAddress = marshaller_1.marshaller.marshalAddress(address);
            const code = yield this.sendRawPayloadAsync({
                method: 'eth_getCode',
                params: [encodedAddress, marshalledDefaultBlock],
            });
            return code;
        });
    }
    /**
     * Gets the debug trace of a transaction
     * @param  txHash Hash of the transactuon to get a trace for
     * @param  traceParams Config object allowing you to specify if you need memory/storage/stack traces.
     * @return Transaction trace
     */
    getTransactionTraceAsync(txHash, traceParams) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isHexString('txHash', txHash);
            const trace = yield this.sendRawPayloadAsync({
                method: 'debug_traceTransaction',
                params: [txHash, traceParams],
            });
            return trace;
        });
    }
    /**
     * Sign a message with a specific address's private key (`eth_sign`)
     * @param address Address of signer
     * @param message Message to sign
     * @returns Signature string (might be VRS or RSV depending on the Signer)
     */
    signMessageAsync(address, message) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isETHAddressHex('address', address);
            assert_1.assert.isString('message', message); // TODO: Should this be stricter? Hex string?
            const signData = yield this.sendRawPayloadAsync({
                method: 'eth_sign',
                params: [address, message],
            });
            return signData;
        });
    }
    /**
     * Sign an EIP712 typed data message with a specific address's private key (`eth_signTypedData`)
     * @param address Address of signer
     * @param typedData Typed data message to sign
     * @returns Signature string (as RSV)
     */
    signTypedDataAsync(address, typedData) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isETHAddressHex('address', address);
            assert_1.assert.doesConformToSchema('typedData', typedData, json_schemas_1.schemas.eip712TypedDataSchema);
            // Try decreasing versions of `eth_signTypedData` until it works.
            const methodsToTry = ['eth_signTypedData_v4', 'eth_signTypedData_v3', 'eth_signTypedData'];
            let lastErr;
            for (const method of methodsToTry) {
                try {
                    return yield this.sendRawPayloadAsync({
                        method,
                        // `eth_signTypedData` expects an object, whereas the others expect
                        // a JSON string.
                        params: [address, method === 'eth_signTypedData' ? typedData : JSON.stringify(typedData)],
                    });
                }
                catch (err) {
                    lastErr = err;
                    // If there are no more methods to try or the error says something other
                    // than the method not existing, throw.
                    if (!/(not handled|does not exist|not supported)/.test(err.message)) {
                        throw err;
                    }
                }
            }
            throw lastErr;
        });
    }
    /**
     * Fetches the latest block number
     * @returns Block number
     */
    getBlockNumberAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumberHex = yield this.sendRawPayloadAsync({
                method: 'eth_blockNumber',
                params: [],
            });
            const blockNumber = utils_2.utils.convertHexToNumberOrNull(blockNumberHex);
            return blockNumber;
        });
    }
    /**
     * Fetches the nonce for an account (transaction count for EOAs).
     * @param address Address of account.
     * @param defaultBlock Block height at which to make the call. Defaults to `latest`
     * @returns Account nonce.
     */
    getAccountNonceAsync(address, defaultBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isETHAddressHex('address', address);
            if (defaultBlock !== undefined) {
                Web3Wrapper._assertBlockParam(defaultBlock);
            }
            const marshalledDefaultBlock = marshaller_1.marshaller.marshalBlockParam(defaultBlock);
            const encodedAddress = marshaller_1.marshaller.marshalAddress(address);
            const nonceHex = yield this.sendRawPayloadAsync({
                method: 'eth_getTransactionCount',
                params: [encodedAddress, marshalledDefaultBlock],
            });
            assert_1.assert.isHexString('nonce', nonceHex);
            // tslint:disable-next-line:custom-no-magic-numbers
            return parseInt(nonceHex.substr(2), 16);
        });
    }
    /**
     * Fetch a specific Ethereum block without transaction data
     * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
     * @returns The requested block without transaction data, or undefined if block was not found
     * (e.g the node isn't fully synced, there was a block re-org and the requested block was uncles, etc...)
     */
    getBlockIfExistsAsync(blockParam) {
        return __awaiter(this, void 0, void 0, function* () {
            Web3Wrapper._assertBlockParamOrString(blockParam);
            const encodedBlockParam = marshaller_1.marshaller.marshalBlockParam(blockParam);
            const method = utils_2.utils.isHexStrict(blockParam) ? 'eth_getBlockByHash' : 'eth_getBlockByNumber';
            const shouldIncludeTransactionData = false;
            const blockWithoutTransactionDataWithHexValuesOrNull = yield this.sendRawPayloadAsync({
                method,
                params: [encodedBlockParam, shouldIncludeTransactionData],
            });
            let blockWithoutTransactionDataIfExists;
            if (blockWithoutTransactionDataWithHexValuesOrNull !== null) {
                blockWithoutTransactionDataIfExists = marshaller_1.marshaller.unmarshalIntoBlockWithoutTransactionData(blockWithoutTransactionDataWithHexValuesOrNull);
            }
            return blockWithoutTransactionDataIfExists;
        });
    }
    /**
     * Fetch a specific Ethereum block with transaction data
     * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
     * @returns The requested block with transaction data
     */
    getBlockWithTransactionDataAsync(blockParam) {
        return __awaiter(this, void 0, void 0, function* () {
            Web3Wrapper._assertBlockParamOrString(blockParam);
            let encodedBlockParam = blockParam;
            if (_.isNumber(blockParam)) {
                encodedBlockParam = utils_2.utils.numberToHex(blockParam);
            }
            const method = utils_2.utils.isHexStrict(blockParam) ? 'eth_getBlockByHash' : 'eth_getBlockByNumber';
            const shouldIncludeTransactionData = true;
            const blockWithTransactionDataWithHexValues = yield this.sendRawPayloadAsync({
                method,
                params: [encodedBlockParam, shouldIncludeTransactionData],
            });
            const blockWithoutTransactionData = marshaller_1.marshaller.unmarshalIntoBlockWithTransactionData(blockWithTransactionDataWithHexValues);
            return blockWithoutTransactionData;
        });
    }
    /**
     * Fetch a block's timestamp
     * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
     * @returns The block's timestamp
     */
    getBlockTimestampAsync(blockParam) {
        return __awaiter(this, void 0, void 0, function* () {
            Web3Wrapper._assertBlockParamOrString(blockParam);
            const blockIfExists = yield this.getBlockIfExistsAsync(blockParam);
            if (blockIfExists === undefined) {
                throw new Error(`Failed to fetch block with blockParam: ${JSON.stringify(blockParam)}`);
            }
            return blockIfExists.timestamp;
        });
    }
    /**
     * Retrieve the user addresses available through the backing provider
     * @returns Available user addresses
     */
    getAvailableAddressesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = yield this.sendRawPayloadAsync({
                method: 'eth_accounts',
                params: [],
            });
            const normalizedAddresses = _.map(addresses, address => address.toLowerCase());
            return normalizedAddresses;
        });
    }
    /**
     * Take a snapshot of the blockchain state on a TestRPC/Ganache local node
     * @returns The snapshot id. This can be used to revert to this snapshot
     */
    takeSnapshotAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshotId = Number(yield this.sendRawPayloadAsync({ method: 'evm_snapshot', params: [] }));
            return snapshotId;
        });
    }
    /**
     * Revert the blockchain state to a previous snapshot state on TestRPC/Ganache local node
     * @param snapshotId snapshot id to revert to
     * @returns Whether the revert was successful
     */
    revertSnapshotAsync(snapshotId) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isNumber('snapshotId', snapshotId);
            const didRevert = yield this.sendRawPayloadAsync({ method: 'evm_revert', params: [snapshotId] });
            return didRevert;
        });
    }
    /**
     * Mine a block on a TestRPC/Ganache local node
     */
    mineBlockAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sendRawPayloadAsync({ method: 'evm_mine', params: [] });
        });
    }
    /**
     * Increase the next blocks timestamp on TestRPC/Ganache or Geth local node.
     * Will throw if provider is neither TestRPC/Ganache or Geth.
     * @param timeDelta Amount of time to add in seconds
     */
    increaseTimeAsync(timeDelta) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isNumber('timeDelta', timeDelta);
            // Detect Geth vs. Ganache and use appropriate endpoint.
            const version = yield this.getNodeVersionAsync();
            if (_.includes(version, uniqueVersionIds.geth)) {
                return this.sendRawPayloadAsync({ method: 'debug_increaseTime', params: [timeDelta] });
            }
            else if (_.includes(version, uniqueVersionIds.ganache)) {
                return this.sendRawPayloadAsync({ method: 'evm_increaseTime', params: [timeDelta] });
            }
            else {
                throw new Error(`Unknown client version: ${version}`);
            }
        });
    }
    /**
     * Retrieve smart contract logs for a given filter
     * @param filter Parameters by which to filter which logs to retrieve
     * @returns The corresponding log entries
     */
    getLogsAsync(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filter.blockHash !== undefined && (filter.fromBlock !== undefined || filter.toBlock !== undefined)) {
                throw new Error(`Cannot specify 'blockHash' as well as 'fromBlock'/'toBlock' in the filter supplied to 'getLogsAsync'`);
            }
            let fromBlock = filter.fromBlock;
            if (_.isNumber(fromBlock)) {
                fromBlock = utils_2.utils.numberToHex(fromBlock);
            }
            let toBlock = filter.toBlock;
            if (_.isNumber(toBlock)) {
                toBlock = utils_2.utils.numberToHex(toBlock);
            }
            const serializedFilter = Object.assign(Object.assign({}, filter), { fromBlock,
                toBlock });
            const payload = {
                method: 'eth_getLogs',
                params: [serializedFilter],
            };
            const rawLogs = yield this.sendRawPayloadAsync(payload);
            const formattedLogs = _.map(rawLogs, marshaller_1.marshaller.unmarshalLog.bind(marshaller_1.marshaller));
            return formattedLogs;
        });
    }
    /**
     * Calculate the estimated gas cost for a given transaction
     * @param txData Transaction data
     * @returns Estimated gas cost
     */
    estimateGasAsync(txData) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.doesConformToSchema('txData', txData, json_schemas_1.schemas.txDataSchema);
            const txDataHex = marshaller_1.marshaller.marshalTxData(txData);
            const gasHex = yield this.sendRawPayloadAsync({ method: 'eth_estimateGas', params: [txDataHex] });
            const gas = utils_2.utils.convertHexToNumber(gasHex);
            return gas;
        });
    }
    /**
     * Generate an access list for an ethereum call and also compute the gas used.
     * @param callData Call data
     * @param defaultBlock Block height at which to make the call. Defaults to 'latest'.
     * @returns The access list and gas used.
     */
    createAccessListAsync(callData, defaultBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.doesConformToSchema('callData', callData, json_schemas_1.schemas.callDataSchema, [
                json_schemas_1.schemas.addressSchema,
                json_schemas_1.schemas.numberSchema,
                json_schemas_1.schemas.jsNumber,
            ]);
            const rawResult = yield this.sendRawPayloadAsync({
                method: 'eth_createAccessList',
                params: [marshaller_1.marshaller.marshalCallData(callData), marshaller_1.marshaller.marshalBlockParam(defaultBlock)],
            });
            if (rawResult.error) {
                throw new Error(rawResult.error);
            }
            return {
                accessList: rawResult.accessList.reduce((o, v) => {
                    o[v.address] = o[v.address] || [];
                    o[v.address].push(...(v.storageKeys || []));
                    return o;
                }, 
                // tslint:disable-next-line: no-object-literal-type-assertion
                {}),
                // tslint:disable-next-line: custom-no-magic-numbers
                gasUsed: parseInt(rawResult.gasUsed.slice(2), 16),
            };
        });
    }
    /**
     * Call a smart contract method at a given block height
     * @param callData Call data
     * @param defaultBlock Block height at which to make the call. Defaults to `latest`
     * @returns The raw call result
     */
    callAsync(callData, defaultBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.doesConformToSchema('callData', callData, json_schemas_1.schemas.callDataSchema);
            if (defaultBlock !== undefined) {
                Web3Wrapper._assertBlockParam(defaultBlock);
            }
            const marshalledDefaultBlock = marshaller_1.marshaller.marshalBlockParam(defaultBlock);
            const callDataHex = marshaller_1.marshaller.marshalCallData(callData);
            const overrides = marshaller_1.marshaller.marshalCallOverrides(callData.overrides || {});
            const rawCallResult = yield this.sendRawPayloadAsync({
                method: 'eth_call',
                params: [callDataHex, marshalledDefaultBlock, ...(Object.keys(overrides).length === 0 ? [] : [overrides])],
            });
            return rawCallResult;
        });
    }
    /**
     * Send a transaction
     * @param txData Transaction data
     * @returns Transaction hash
     */
    sendTransactionAsync(txData) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.doesConformToSchema('txData', txData, json_schemas_1.schemas.txDataSchema);
            const txDataHex = marshaller_1.marshaller.marshalTxData(txData);
            const txHash = yield this.sendRawPayloadAsync({ method: 'eth_sendTransaction', params: [txDataHex] });
            return txHash;
        });
    }
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
    awaitTransactionMinedAsync(txHash, pollingIntervalMs = 1000, timeoutMs) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isHexString('txHash', txHash);
            assert_1.assert.isNumber('pollingIntervalMs', pollingIntervalMs);
            if (timeoutMs !== undefined) {
                assert_1.assert.isNumber('timeoutMs', timeoutMs);
            }
            // Immediately check if the transaction has already been mined.
            let transactionReceipt = yield this.getTransactionReceiptIfExistsAsync(txHash);
            if (transactionReceipt !== undefined) {
                const logsWithDecodedArgs = _.map(transactionReceipt.logs, this.abiDecoder.tryToDecodeLogOrNoop.bind(this.abiDecoder));
                const transactionReceiptWithDecodedLogArgs = Object.assign(Object.assign({}, transactionReceipt), { logs: logsWithDecodedArgs });
                return transactionReceiptWithDecodedLogArgs;
            }
            // Otherwise, check again every pollingIntervalMs.
            let wasTimeoutExceeded = false;
            if (timeoutMs) {
                setTimeout(() => (wasTimeoutExceeded = true), timeoutMs);
            }
            const txReceiptPromise = new Promise((resolve, reject) => {
                const intervalId = utils_1.intervalUtils.setAsyncExcludingInterval(() => __awaiter(this, void 0, void 0, function* () {
                    if (wasTimeoutExceeded) {
                        utils_1.intervalUtils.clearAsyncExcludingInterval(intervalId);
                        return reject(types_1.Web3WrapperErrors.TransactionMiningTimeout);
                    }
                    transactionReceipt = yield this.getTransactionReceiptIfExistsAsync(txHash);
                    if (transactionReceipt !== undefined) {
                        utils_1.intervalUtils.clearAsyncExcludingInterval(intervalId);
                        const logsWithDecodedArgs = _.map(transactionReceipt.logs, this.abiDecoder.tryToDecodeLogOrNoop.bind(this.abiDecoder));
                        const transactionReceiptWithDecodedLogArgs = Object.assign(Object.assign({}, transactionReceipt), { logs: logsWithDecodedArgs });
                        resolve(transactionReceiptWithDecodedLogArgs);
                    }
                }), pollingIntervalMs, (err) => {
                    utils_1.intervalUtils.clearAsyncExcludingInterval(intervalId);
                    reject(err);
                });
            });
            const txReceipt = yield txReceiptPromise;
            return txReceipt;
        });
    }
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
    awaitTransactionSuccessAsync(txHash, pollingIntervalMs = 1000, timeoutMs) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.awaitTransactionMinedAsync(txHash, pollingIntervalMs, timeoutMs);
            if (receipt.status !== 1) {
                throw new Error(`Transaction failed: ${txHash}`);
            }
            return receipt;
        });
    }
    /**
     * Calls the 'debug_setHead' JSON RPC method, which sets the current head of
     * the local chain by block number. Note, this is a destructive action and
     * may severely damage your chain. Use with extreme caution. As of now, this
     * is only supported by Geth. It sill throw if the 'debug_setHead' method is
     * not supported.
     * @param  blockNumber The block number to reset to.
     */
    setHeadAsync(blockNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.assert.isNumber('blockNumber', blockNumber);
            yield this.sendRawPayloadAsync({ method: 'debug_setHead', params: [utils_2.utils.numberToHex(blockNumber)] });
        });
    }
    /**
     * Sends a raw Ethereum JSON RPC payload and returns the response's `result` key
     * @param payload A partial JSON RPC payload. No need to include version, id, params (if none needed)
     * @return The contents nested under the result key of the response body
     */
    sendRawPayloadAsync(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.method) {
                throw new Error(`Must supply method in JSONRPCRequestPayload, tried: [${payload}]`);
            }
            // tslint:disable:no-object-literal-type-assertion
            const payloadWithDefaults = Object.assign({ id: this._jsonRpcRequestId++, params: [], jsonrpc: '2.0' }, payload);
            // tslint:enable:no-object-literal-type-assertion
            const sendAsync = utils_1.promisify(this._provider.sendAsync.bind(this._provider));
            const response = yield sendAsync(payloadWithDefaults); // will throw if it fails
            if (!response) {
                throw new Error(`No response`);
            }
            const errorMessage = response.error ? response.error.message || response.error : undefined;
            if (errorMessage) {
                throw new Error(errorMessage);
            }
            if (response.result === undefined) {
                throw new Error(`JSON RPC response has no result`);
            }
            return response.result;
        });
    }
    /**
     * Returns either NodeType.Geth or NodeType.Ganache depending on the type of
     * the backing Ethereum node. Throws for any other type of node.
     */
    getNodeTypeAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield this.getNodeVersionAsync();
            if (_.includes(version, uniqueVersionIds.geth)) {
                return types_1.NodeType.Geth;
            }
            else if (_.includes(version, uniqueVersionIds.ganache)) {
                return types_1.NodeType.Ganache;
            }
            else {
                throw new Error(`Unknown client version: ${version}`);
            }
        });
    }
} // tslint:disable-line:max-file-line-count
exports.Web3Wrapper = Web3Wrapper;
//# sourceMappingURL=web3_wrapper.js.map