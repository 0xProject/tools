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
exports.RevertTraceSubprovider = void 0;
const sol_tracing_utils_1 = require("@0x/sol-tracing-utils");
const chalk_1 = require("chalk");
const ethereumjs_util_1 = require("ethereumjs-util");
const _ = require("lodash");
const loglevel_1 = require("loglevel");
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It is used to report call stack traces whenever a revert occurs.
 */
class RevertTraceSubprovider extends sol_tracing_utils_1.TraceCollectionSubprovider {
    /**
     * Instantiates a RevertTraceSubprovider instance
     * @param artifactAdapter Adapter for used artifacts format (0x, truffle, giveth, etc.)
     * @param defaultFromAddress default from address to use when sending transactions
     * @param isVerbose If true, we will log any unknown transactions. Otherwise we will ignore them
     */
    constructor(artifactAdapter, defaultFromAddress, isVerbose = true) {
        const traceCollectionSubproviderConfig = {
            shouldCollectTransactionTraces: true,
            shouldCollectGasEstimateTraces: true,
            shouldCollectCallTraces: true,
        };
        super(defaultFromAddress, traceCollectionSubproviderConfig);
        this._artifactAdapter = artifactAdapter;
        this._logger = loglevel_1.getLogger('sol-trace');
        this._logger.setLevel(isVerbose ? loglevel_1.levels.TRACE : loglevel_1.levels.ERROR);
    }
    // tslint:disable-next-line:no-unused-variable
    _recordTxTraceAsync(address, data, txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._web3Wrapper.awaitTransactionMinedAsync(txHash, 0);
            const trace = yield this._web3Wrapper.getTransactionTraceAsync(txHash, {
                disableMemory: true,
                disableStack: false,
                disableStorage: true,
            });
            const evmCallStack = sol_tracing_utils_1.getRevertTrace(trace.structLogs, address);
            if (evmCallStack.length > 0) {
                // if getRevertTrace returns a call stack it means there was a
                // revert.
                yield this._printStackTraceAsync(evmCallStack);
            }
        });
    }
    _printStackTraceAsync(evmCallStack) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceSnippets = [];
            if (this._contractsData === undefined) {
                this._contractsData = yield this._artifactAdapter.collectContractsDataAsync();
            }
            for (const evmCallStackEntry of evmCallStack) {
                const isContractCreation = evmCallStackEntry.address === sol_tracing_utils_1.constants.NEW_CONTRACT;
                if (isContractCreation) {
                    this._logger.error('Contract creation not supported');
                    continue;
                }
                const bytecode = yield this._web3Wrapper.getContractCodeAsync(evmCallStackEntry.address);
                const contractData = sol_tracing_utils_1.utils.getContractDataIfExists(this._contractsData, bytecode);
                if (contractData === undefined) {
                    const shortenHex = (hex) => {
                        /**
                         * Length choosen so that both error messages are of the same length
                         * and it's enough data to figure out which artifact has a problem.
                         */
                        const length = 18;
                        return `${hex.substr(0, length + 2)}...${hex.substr(hex.length - length, length)}`;
                    };
                    const errMsg = isContractCreation
                        ? `Unable to find matching bytecode for contract creation ${chalk_1.default.bold(shortenHex(bytecode))}, please check your artifacts. Ignoring...`
                        : `Unable to find matching bytecode for contract address ${chalk_1.default.bold(evmCallStackEntry.address)}, please check your artifacts. Ignoring...`;
                    this._logger.warn(errMsg);
                    continue;
                }
                const bytecodeHex = ethereumjs_util_1.stripHexPrefix(bytecode);
                const sourceMap = isContractCreation ? contractData.sourceMap : contractData.sourceMapRuntime;
                const pcToSourceRange = sol_tracing_utils_1.parseSourceMap(contractData.sourceCodes, sourceMap, bytecodeHex, contractData.sources);
                // tslint:disable-next-line:no-unnecessary-initializer
                let sourceRange = undefined;
                let pc = evmCallStackEntry.structLog.pc;
                // Sometimes there is not a mapping for this pc (e.g. if the revert
                // actually happens in assembly). In that case, we want to keep
                // searching backwards by decrementing the pc until we find a
                // mapped source range.
                while (sourceRange === undefined && pc > 0) {
                    sourceRange = pcToSourceRange[pc];
                    pc -= 1;
                }
                if (sourceRange === undefined) {
                    this._logger.warn(`could not find matching sourceRange for structLog: ${JSON.stringify(_.omit(evmCallStackEntry.structLog, 'stack'))}`);
                    continue;
                }
                const fileNameToFileIndex = _.invert(contractData.sources);
                const fileIndex = _.parseInt(fileNameToFileIndex[sourceRange.fileName]);
                const sourceSnippet = sol_tracing_utils_1.getSourceRangeSnippet(sourceRange, contractData.sourceCodes[fileIndex]);
                sourceSnippets.push(sourceSnippet);
            }
            const filteredSnippets = filterSnippets(sourceSnippets);
            if (filteredSnippets.length > 0) {
                this._logger.error('\n\nStack trace for REVERT:\n');
                _.forEach(_.reverse(filteredSnippets), snippet => {
                    const traceString = getStackTraceString(snippet);
                    this._logger.error(traceString);
                });
                this._logger.error('\n');
            }
            else {
                this._logger.error('REVERT detected but could not determine stack trace');
            }
        });
    }
}
exports.RevertTraceSubprovider = RevertTraceSubprovider;
// removes duplicates and if statements
function filterSnippets(sourceSnippets) {
    if (sourceSnippets.length === 0) {
        return [];
    }
    const results = [sourceSnippets[0]];
    let prev = sourceSnippets[0];
    for (const sourceSnippet of sourceSnippets) {
        if (sourceSnippet.source === prev.source) {
            prev = sourceSnippet;
            continue;
        }
        results.push(sourceSnippet);
        prev = sourceSnippet;
    }
    return results;
}
function getStackTraceString(sourceSnippet) {
    let result = `${sourceSnippet.fileName}:${sourceSnippet.range.start.line}:${sourceSnippet.range.start.column}`;
    const snippetString = getSourceSnippetString(sourceSnippet);
    if (snippetString !== '') {
        result += `:\n        ${snippetString}`;
    }
    return result;
}
function getSourceSnippetString(sourceSnippet) {
    return `${sourceSnippet.source}`;
}
//# sourceMappingURL=revert_trace_subprovider.js.map