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
exports.TraceCollectionSubprovider = void 0;
const dev_utils_1 = require("@0x/dev-utils");
const subproviders_1 = require("@0x/subproviders");
const utils_1 = require("@0x/utils");
const web3_wrapper_1 = require("@0x/web3-wrapper");
const ethers_1 = require("ethers");
const _ = require("lodash");
const semaphore_async_await_1 = require("semaphore-async-await");
const constants_1 = require("./constants");
const types_1 = require("./types");
const BLOCK_GAS_LIMIT = 6000000;
// HACK: This wrapper outputs errors to console even if the promise gets ignored
// we need this because web3-provider-engine does not handle promises in
// the after function of next(after).
function logAsyncErrors(fn) {
    function wrappedAsync(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fn(...args);
            }
            catch (err) {
                utils_1.logUtils.log(err);
                throw err;
            }
        });
    }
    return wrappedAsync;
}
// Because there is no notion of a call trace in the Ethereum rpc - we collect them in a rather non-obvious/hacky way.
// On each call - we create a snapshot, execute the call as a transaction, get the trace, revert the snapshot.
// That allows us to avoid influencing test behaviour.
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It collects traces of all transactions that were sent and all calls that were executed through JSON RPC. It must
 * be extended by implementing the _recordTxTraceAsync method which is called for every transaction.
 */
class TraceCollectionSubprovider extends subproviders_1.Subprovider {
    /**
     * Instantiates a TraceCollectionSubprovider instance
     * @param defaultFromAddress default from address to use when sending transactions
     */
    constructor(defaultFromAddress, config) {
        super();
        // Lock is used to not accept normal transactions while doing call/snapshot magic because they'll be reverted later otherwise
        this._lock = new semaphore_async_await_1.Lock();
        this._isEnabled = true;
        this._defaultFromAddress = defaultFromAddress;
        this._config = config;
    }
    /**
     * Starts trace collection
     */
    start() {
        this._isEnabled = true;
    }
    /**
     * Stops trace collection
     */
    stop() {
        this._isEnabled = false;
    }
    /**
     * This method conforms to the web3-provider-engine interface.
     * It is called internally by the ProviderEngine when it is this subproviders
     * turn to handle a JSON RPC request.
     * @param payload JSON RPC payload
     * @param next Callback to call if this subprovider decides not to handle the request
     * @param _end Callback to call if subprovider handled the request and wants to pass back the request.
     */
    // tslint:disable-next-line:prefer-function-over-method async-suffix
    handleRequest(payload, next, _end) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isEnabled) {
                switch (payload.method) {
                    case 'eth_sendTransaction':
                        if (!this._config.shouldCollectTransactionTraces) {
                            next();
                        }
                        else {
                            const txData = payload.params[0];
                            next(logAsyncErrors(this._onTransactionSentAsync.bind(this, txData)));
                        }
                        return;
                    case 'eth_sendRawTransaction':
                        if (!this._config.shouldCollectTransactionTraces) {
                            next();
                        }
                        else {
                            const txData = ethers_1.utils.parseTransaction(payload.params[0]);
                            if (txData.to === null) {
                                txData.to = constants_1.constants.NEW_CONTRACT;
                            }
                            next(logAsyncErrors(this._onTransactionSentAsync.bind(this, txData)));
                        }
                        return;
                    case 'eth_call':
                        if (!this._config.shouldCollectCallTraces) {
                            next();
                        }
                        else {
                            const callData = payload.params[0];
                            next(logAsyncErrors(this._onCallOrGasEstimateExecutedAsync.bind(this, callData)));
                        }
                        return;
                    case 'eth_estimateGas':
                        if (!this._config.shouldCollectGasEstimateTraces) {
                            next();
                        }
                        else {
                            const estimateGasData = payload.params[0];
                            next(logAsyncErrors(this._onCallOrGasEstimateExecutedAsync.bind(this, estimateGasData)));
                        }
                        return;
                    default:
                        next();
                        return;
                }
            }
            else {
                next();
                return;
            }
        });
    }
    /**
     * Set's the subprovider's engine to the ProviderEngine it is added to.
     * This is only called within the ProviderEngine source code, do not call
     * directly.
     * @param engine The ProviderEngine this subprovider is added to
     */
    setEngine(engine) {
        super.setEngine(engine);
        this._web3Wrapper = new web3_wrapper_1.Web3Wrapper(engine);
    }
    _onTransactionSentAsync(txData, err, txHash, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(txData.isFakeTransaction || txData.from === txData.to)) {
                // This transaction is a usual transaction. Not a call executed as one.
                // And we don't want it to be executed within a snapshotting period
                yield this._lock.acquire();
            }
            const NULL_ADDRESS = '0x0';
            if (err === null) {
                const toAddress = txData.to === undefined || txData.to === NULL_ADDRESS ? constants_1.constants.NEW_CONTRACT : txData.to;
                yield this._recordTxTraceAsync(toAddress, txData.data, txHash);
            }
            else {
                const latestBlock = yield this._web3Wrapper.getBlockWithTransactionDataAsync(types_1.BlockParamLiteral.Latest);
                const transactions = latestBlock.transactions;
                for (const transaction of transactions) {
                    const toAddress = txData.to === undefined || txData.to === NULL_ADDRESS ? constants_1.constants.NEW_CONTRACT : txData.to;
                    yield this._recordTxTraceAsync(toAddress, transaction.input, transaction.hash);
                }
            }
            if (!txData.isFakeTransaction) {
                // This transaction is a usual transaction. Not a call executed as one.
                // And we don't want it to be executed within a snapshotting period
                this._lock.release();
            }
            cb();
        });
    }
    _onCallOrGasEstimateExecutedAsync(callData, _err, _callResult, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._recordCallOrGasEstimateTraceAsync(callData);
            cb();
        });
    }
    _recordCallOrGasEstimateTraceAsync(callData) {
        return __awaiter(this, void 0, void 0, function* () {
            // We don't want other transactions to be executed during snashotting period, that's why we lock the
            // transaction execution for all transactions except our fake ones.
            yield this._lock.acquire();
            const blockchainLifecycle = new dev_utils_1.BlockchainLifecycle(this._web3Wrapper);
            yield blockchainLifecycle.startAsync();
            const fakeTxData = Object.assign(Object.assign({ gas: `0x${BLOCK_GAS_LIMIT.toString(16)}`, isFakeTransaction: true }, callData), { from: callData.from || this._defaultFromAddress });
            try {
                const txData = web3_wrapper_1.marshaller.unmarshalTxData(fakeTxData);
                const txHash = yield this._web3Wrapper.sendTransactionAsync(txData);
                yield this._web3Wrapper.awaitTransactionMinedAsync(txHash, 0);
            }
            catch (err) {
                // TODO(logvinov) Check that transaction failed and not some other exception
                // Even if this transaction failed - we've already recorded it's trace.
                _.noop();
            }
            yield blockchainLifecycle.revertAsync();
            this._lock.release();
        });
    }
}
exports.TraceCollectionSubprovider = TraceCollectionSubprovider;
//# sourceMappingURL=trace_collection_subprovider.js.map