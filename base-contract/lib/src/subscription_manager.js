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
exports.SubscriptionManager = void 0;
const utils_1 = require("@0x/utils");
const web3_wrapper_1 = require("@0x/web3-wrapper");
const ethereum_types_1 = require("ethereum-types");
const ethereumjs_blockstream_1 = require("ethereumjs-blockstream");
const types_1 = require("./types");
const filter_utils_1 = require("./utils/filter_utils");
const DEFAULT_BLOCK_POLLING_INTERVAL = 1000;
class SubscriptionManager {
    constructor(abi, web3Wrapper) {
        this.abi = abi;
        this._web3Wrapper = web3Wrapper;
        this._filters = {};
        this._filterCallbacks = {};
        this._blockAndLogStreamerIfExists = undefined;
        this._onLogAddedSubscriptionToken = undefined;
        this._onLogRemovedSubscriptionToken = undefined;
    }
    static _onBlockAndLogStreamerError(isVerbose, err) {
        // Since Blockstream errors are all recoverable, we simply log them if the verbose
        // config is passed in.
        if (isVerbose) {
            utils_1.logUtils.warn(err);
        }
    }
    unsubscribeAll() {
        const filterTokens = Object.keys(this._filterCallbacks);
        filterTokens.forEach(filterToken => this.unsubscribe(filterToken));
    }
    unsubscribe(filterToken, err) {
        if (this._filters[filterToken] === undefined) {
            throw new Error(types_1.SubscriptionErrors.SubscriptionNotFound);
        }
        if (err !== undefined) {
            const callback = this._filterCallbacks[filterToken];
            callback(err, undefined);
        }
        delete this._filters[filterToken];
        delete this._filterCallbacks[filterToken];
        if (Object.keys(this._filters).length === 0) {
            this._stopBlockAndLogStream();
        }
    }
    subscribe(address, eventName, indexFilterValues, abi, callback, isVerbose = false, blockPollingIntervalMs) {
        const filter = filter_utils_1.filterUtils.getFilter(address, eventName, indexFilterValues, abi);
        if (this._blockAndLogStreamerIfExists === undefined) {
            this._startBlockAndLogStream(isVerbose, blockPollingIntervalMs);
        }
        const filterToken = filter_utils_1.filterUtils.generateUUID();
        this._filters[filterToken] = filter;
        this._filterCallbacks[filterToken] = callback; // tslint:disable-line:no-unnecessary-type-assertion
        return filterToken;
    }
    getLogsAsync(address, eventName, blockRange, indexFilterValues, abi) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = filter_utils_1.filterUtils.getFilter(address, eventName, indexFilterValues, abi, blockRange);
            const logs = yield this._web3Wrapper.getLogsAsync(filter);
            const logsWithDecodedArguments = logs.map(this._tryToDecodeLogOrNoop.bind(this));
            return logsWithDecodedArguments;
        });
    }
    _tryToDecodeLogOrNoop(log) {
        const abiDecoder = new utils_1.AbiDecoder([this.abi]);
        const logWithDecodedArgs = abiDecoder.tryToDecodeLogOrNoop(log);
        return logWithDecodedArgs;
    }
    _onLogStateChanged(isRemoved, blockHash, rawLogs) {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const logs = rawLogs.map(rawLog => web3_wrapper_1.marshaller.unmarshalLog(rawLog));
        logs.forEach(log => {
            Object.entries(this._filters).forEach(([filterToken, filter]) => {
                if (filter_utils_1.filterUtils.matchesFilter(log, filter)) {
                    const decodedLog = this._tryToDecodeLogOrNoop(log);
                    const logEvent = {
                        log: decodedLog,
                        isRemoved,
                    };
                    this._filterCallbacks[filterToken](null, logEvent);
                }
            });
        });
    }
    _startBlockAndLogStream(isVerbose, blockPollingIntervalMs) {
        if (this._blockAndLogStreamerIfExists !== undefined) {
            throw new Error(types_1.SubscriptionErrors.SubscriptionAlreadyPresent);
        }
        this._blockAndLogStreamerIfExists = new ethereumjs_blockstream_1.BlockAndLogStreamer(this._blockstreamGetBlockOrNullAsync.bind(this), this._blockstreamGetLogsAsync.bind(this), SubscriptionManager._onBlockAndLogStreamerError.bind(this, isVerbose));
        const catchAllLogFilter = {};
        this._blockAndLogStreamerIfExists.addLogFilter(catchAllLogFilter);
        const _blockPollingIntervalMs = blockPollingIntervalMs === undefined ? DEFAULT_BLOCK_POLLING_INTERVAL : blockPollingIntervalMs;
        this._blockAndLogStreamIntervalIfExists = utils_1.intervalUtils.setAsyncExcludingInterval(this._reconcileBlockAsync.bind(this), _blockPollingIntervalMs, SubscriptionManager._onBlockAndLogStreamerError.bind(this, isVerbose));
        let isRemoved = false;
        this._onLogAddedSubscriptionToken = this._blockAndLogStreamerIfExists.subscribeToOnLogsAdded(this._onLogStateChanged.bind(this, isRemoved));
        isRemoved = true;
        this._onLogRemovedSubscriptionToken = this._blockAndLogStreamerIfExists.subscribeToOnLogsRemoved(this._onLogStateChanged.bind(this, isRemoved));
    }
    // This method only exists in order to comply with the expected interface of Blockstream's constructor
    _blockstreamGetBlockOrNullAsync(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const shouldIncludeTransactionData = false;
            const blockOrNull = yield this._web3Wrapper.sendRawPayloadAsync({
                method: 'eth_getBlockByHash',
                params: [hash, shouldIncludeTransactionData],
            });
            return blockOrNull;
        });
    }
    // This method only exists in order to comply with the expected interface of Blockstream's constructor
    _blockstreamGetLatestBlockOrNullAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const shouldIncludeTransactionData = false;
            const blockOrNull = yield this._web3Wrapper.sendRawPayloadAsync({
                method: 'eth_getBlockByNumber',
                params: [ethereum_types_1.BlockParamLiteral.Latest, shouldIncludeTransactionData],
            });
            return blockOrNull;
        });
    }
    // This method only exists in order to comply with the expected interface of Blockstream's constructor
    _blockstreamGetLogsAsync(filterOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const logs = yield this._web3Wrapper.sendRawPayloadAsync({
                method: 'eth_getLogs',
                params: [filterOptions],
            });
            return logs;
        });
    }
    _stopBlockAndLogStream() {
        if (this._blockAndLogStreamerIfExists === undefined) {
            throw new Error(types_1.SubscriptionErrors.SubscriptionNotFound);
        }
        this._blockAndLogStreamerIfExists.unsubscribeFromOnLogsAdded(this._onLogAddedSubscriptionToken);
        this._blockAndLogStreamerIfExists.unsubscribeFromOnLogsRemoved(this._onLogRemovedSubscriptionToken);
        utils_1.intervalUtils.clearAsyncExcludingInterval(this._blockAndLogStreamIntervalIfExists);
        delete this._blockAndLogStreamerIfExists;
    }
    _reconcileBlockAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const latestBlockOrNull = yield this._blockstreamGetLatestBlockOrNullAsync();
            if (latestBlockOrNull === null) {
                return; // noop
            }
            // We need to coerce to Block type cause Web3.Block includes types for mempool blocks
            if (this._blockAndLogStreamerIfExists !== undefined) {
                // If we clear the interval while fetching the block - this._blockAndLogStreamer will be undefined
                yield this._blockAndLogStreamerIfExists.reconcileNewBlock(latestBlockOrNull);
            }
        });
    }
}
exports.SubscriptionManager = SubscriptionManager;
//# sourceMappingURL=subscription_manager.js.map