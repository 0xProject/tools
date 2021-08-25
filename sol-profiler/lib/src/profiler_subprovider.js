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
exports.profilerHandler = exports.ProfilerSubprovider = void 0;
const sol_tracing_utils_1 = require("@0x/sol-tracing-utils");
const utils_1 = require("@0x/utils");
const ethereumjs_util_1 = require("ethereumjs-util");
const _ = require("lodash");
const cost_utils_1 = require("./cost_utils");
const CREATE_COST = 32000;
const BASE_COST = 21000;
const DEPLOYED_BYTE_COST = 200;
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * ProfilerSubprovider is used to profile Solidity code while running tests.
 */
class ProfilerSubprovider extends sol_tracing_utils_1.TraceInfoSubprovider {
    /**
     * Instantiates a ProfilerSubprovider instance
     * @param artifactAdapter Adapter for used artifacts format (0x, truffle, giveth, etc.)
     * @param defaultFromAddress default from address to use when sending transactions
     * @param isVerbose If true, we will log any unknown transactions. Otherwise we will ignore them
     */
    constructor(artifactAdapter, defaultFromAddress, isVerbose = true) {
        const traceCollectionSubproviderConfig = {
            shouldCollectTransactionTraces: true,
            shouldCollectGasEstimateTraces: false,
            shouldCollectCallTraces: false,
        };
        super(defaultFromAddress, traceCollectionSubproviderConfig);
        this._profilerCollector = new sol_tracing_utils_1.TraceCollector(artifactAdapter, isVerbose, exports.profilerHandler);
    }
    _handleSubTraceInfoAsync(subTraceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._profilerCollector.computeSingleTraceCoverageAsync(subTraceInfo);
        });
    }
    // tslint:disable prefer-function-over-method
    _handleTraceInfoAsync(traceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this._web3Wrapper.getTransactionReceiptIfExistsAsync(traceInfo.txHash);
            if (receipt === undefined) {
                return;
            }
            if (receipt.gasUsed === BASE_COST) {
                // Value transfer
                return;
            }
            utils_1.logUtils.header(`Profiling data for ${traceInfo.txHash}`);
            const callDataCost = cost_utils_1.costUtils.reportCallDataCost(traceInfo);
            const memoryCost = cost_utils_1.costUtils.reportMemoryCost(traceInfo);
            const opcodesCost = cost_utils_1.costUtils.reportOpcodesCost(traceInfo);
            const dataCopyingCost = cost_utils_1.costUtils.reportCopyingCost(traceInfo);
            const newContractCost = CREATE_COST;
            const transactionBaseCost = BASE_COST;
            let totalCost = callDataCost + opcodesCost + BASE_COST;
            utils_1.logUtils.header('Final breakdown', '-');
            if (_.isString(receipt.contractAddress)) {
                const code = yield this._web3Wrapper.getContractCodeAsync(receipt.contractAddress);
                const codeBuff = Buffer.from(ethereumjs_util_1.stripHexPrefix(code), 'hex');
                const codeLength = codeBuff.length;
                const contractSizeCost = codeLength * DEPLOYED_BYTE_COST;
                totalCost += contractSizeCost + CREATE_COST;
                utils_1.logUtils.table({
                    'totalCost = callDataCost + opcodesCost + transactionBaseCost + newContractCost + contractSizeCost': totalCost,
                    callDataCost,
                    'opcodesCost (including memoryCost and dataCopyingCost)': opcodesCost,
                    memoryCost,
                    dataCopyingCost,
                    transactionBaseCost,
                    contractSizeCost,
                    newContractCost,
                });
            }
            else {
                utils_1.logUtils.table({
                    'totalCost = callDataCost + opcodesCost + transactionBaseCost': totalCost,
                    callDataCost,
                    'opcodesCost (including memoryCost and dataCopyingCost)': opcodesCost,
                    memoryCost,
                    dataCopyingCost,
                    transactionBaseCost,
                });
            }
            const unknownGas = receipt.gasUsed - totalCost;
            if (unknownGas !== 0) {
                utils_1.logUtils.warn(`Unable to find the cause for ${unknownGas} gas. It's most probably an issue in sol-profiler. Please report on Github.`);
            }
        });
    }
    /**
     * Write the test profiler results to a file in Istanbul format.
     */
    writeProfilerOutputAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._profilerCollector.writeOutputAsync();
        });
    }
}
exports.ProfilerSubprovider = ProfilerSubprovider;
/**
 * Computed partial coverage for a single file & subtrace for the purposes of
 * gas profiling.
 * @param contractData      Contract metadata (source, srcMap, bytecode)
 * @param subtrace          A subset of a transcation/call trace that was executed within that contract
 * @param pcToSourceRange   A mapping from program counters to source ranges
 * @param fileIndex         Index of a file to compute coverage for
 * @return Partial istanbul coverage for that file & subtrace
 */
const profilerHandler = (contractData, subtrace, pcToSourceRange, fileIndex) => {
    const absoluteFileName = contractData.sources[fileIndex];
    const profilerEntriesDescription = sol_tracing_utils_1.collectCoverageEntries(contractData.sourceCodes[fileIndex]);
    const statementToGasConsumed = {};
    const statementIds = _.keys(profilerEntriesDescription.statementMap);
    // `interestingStructLogs` are those that map back to source ranges within the current file.
    // It also doesn't include any that cannot be mapped back
    // This is a perf optimization reducing the work done in the loop over `statementIds`.
    // TODO(logvinov): Optimize the loop below.
    const interestingStructLogs = _.filter(subtrace, structLog => {
        const sourceRange = pcToSourceRange[structLog.pc];
        if (sourceRange === undefined) {
            return false;
        }
        return sourceRange.fileName === absoluteFileName;
    });
    for (const statementId of statementIds) {
        const statementDescription = profilerEntriesDescription.statementMap[statementId];
        const totalGasCost = _.sum(_.map(interestingStructLogs, structLog => {
            const sourceRange = pcToSourceRange[structLog.pc];
            if (sol_tracing_utils_1.utils.isRangeInside(sourceRange.location, statementDescription)) {
                return structLog.gasCost;
            }
            else {
                return 0;
            }
        }));
        statementToGasConsumed[statementId] = totalGasCost;
    }
    const partialProfilerOutput = {
        [absoluteFileName]: Object.assign(Object.assign({}, profilerEntriesDescription), { path: absoluteFileName, f: {}, s: statementToGasConsumed, b: {} }),
    };
    return partialProfilerOutput;
};
exports.profilerHandler = profilerHandler;
//# sourceMappingURL=profiler_subprovider.js.map