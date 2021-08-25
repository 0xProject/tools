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
exports.CoverageSubprovider = exports.DEFAULT_COVERAGE_SUBPROVIDER_CONFIG = void 0;
const sol_tracing_utils_1 = require("@0x/sol-tracing-utils");
const _ = require("lodash");
const minimatch = require("minimatch");
exports.DEFAULT_COVERAGE_SUBPROVIDER_CONFIG = {
    isVerbose: true,
    ignoreFilesGlobs: [],
};
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It's used to compute your code coverage while running solidity tests.
 */
class CoverageSubprovider extends sol_tracing_utils_1.TraceInfoSubprovider {
    /**
     * Instantiates a CoverageSubprovider instance
     * @param artifactAdapter Adapter for used artifacts format (0x, truffle, giveth, etc.)
     * @param defaultFromAddress default from address to use when sending transactions
     * @param partialConfig Partial configuration object
     */
    constructor(artifactAdapter, defaultFromAddress, partialConfig = {}) {
        const traceCollectionSubproviderConfig = {
            shouldCollectTransactionTraces: true,
            shouldCollectGasEstimateTraces: true,
            shouldCollectCallTraces: true,
        };
        super(defaultFromAddress, traceCollectionSubproviderConfig);
        this._coverageSubproviderCnfig = Object.assign(Object.assign({}, exports.DEFAULT_COVERAGE_SUBPROVIDER_CONFIG), partialConfig);
        this._coverageCollector = new sol_tracing_utils_1.TraceCollector(artifactAdapter, this._coverageSubproviderCnfig.isVerbose, this._coverageHandler.bind(this));
    }
    _handleSubTraceInfoAsync(subTraceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._coverageCollector.computeSingleTraceCoverageAsync(subTraceInfo);
        });
    }
    /**
     * Write the test coverage results to a file in Istanbul format.
     */
    writeCoverageAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._coverageCollector.writeOutputAsync();
        });
    }
    _isFileIgnored(absoluteFileName) {
        for (const ignoreFilesGlob of this._coverageSubproviderCnfig.ignoreFilesGlobs) {
            if (minimatch(absoluteFileName, ignoreFilesGlob)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Computes partial coverage for a single file & subtrace.
     * @param contractData      Contract metadata (source, srcMap, bytecode)
     * @param subtrace          A subset of a transcation/call trace that was executed within that contract
     * @param pcToSourceRange   A mapping from program counters to source ranges
     * @param fileIndex         Index of a file to compute coverage for
     * @return Partial istanbul coverage for that file & subtrace
     */
    _coverageHandler(contractData, subtrace, pcToSourceRange, fileIndex) {
        const absoluteFileName = contractData.sources[fileIndex];
        if (this._isFileIgnored(absoluteFileName)) {
            return {};
        }
        const coverageEntriesDescription = sol_tracing_utils_1.collectCoverageEntries(contractData.sourceCodes[fileIndex], IGNORE_REGEXP);
        // if the source wasn't provided for the fileIndex, we can't cover the file
        if (coverageEntriesDescription === undefined) {
            return {};
        }
        let sourceRanges = _.map(subtrace, structLog => pcToSourceRange[structLog.pc]);
        sourceRanges = _.compact(sourceRanges); // Some PC's don't map to a source range and we just ignore them.
        // By default lodash does a shallow object comparison. We JSON.stringify them and compare as strings.
        sourceRanges = _.uniqBy(sourceRanges, s => JSON.stringify(s)); // We don't care if one PC was covered multiple times within a single transaction
        sourceRanges = _.filter(sourceRanges, sourceRange => sourceRange.fileName === absoluteFileName);
        const branchCoverage = {};
        const branchIds = _.keys(coverageEntriesDescription.branchMap);
        for (const branchId of branchIds) {
            const branchDescription = coverageEntriesDescription.branchMap[branchId];
            const branchIndexToIsBranchCovered = _.map(branchDescription.locations, location => {
                const isBranchCovered = _.some(sourceRanges, range => sol_tracing_utils_1.utils.isRangeInside(range.location, location));
                const timesBranchCovered = Number(isBranchCovered);
                return timesBranchCovered;
            });
            branchCoverage[branchId] = branchIndexToIsBranchCovered;
        }
        const statementCoverage = {};
        const statementIds = _.keys(coverageEntriesDescription.statementMap);
        for (const statementId of statementIds) {
            const statementDescription = coverageEntriesDescription.statementMap[statementId];
            const isStatementCovered = _.some(sourceRanges, range => sol_tracing_utils_1.utils.isRangeInside(range.location, statementDescription));
            const timesStatementCovered = Number(isStatementCovered);
            statementCoverage[statementId] = timesStatementCovered;
        }
        const functionCoverage = {};
        const functionIds = _.keys(coverageEntriesDescription.fnMap);
        for (const fnId of functionIds) {
            const functionDescription = coverageEntriesDescription.fnMap[fnId];
            const isFunctionCovered = _.some(sourceRanges, range => sol_tracing_utils_1.utils.isRangeInside(range.location, functionDescription.loc));
            const timesFunctionCovered = Number(isFunctionCovered);
            functionCoverage[fnId] = timesFunctionCovered;
        }
        // HACK: Solidity doesn't emit any opcodes that map back to modifiers with no args, that's why we map back to the
        // function range and check if there is any covered statement within that range.
        for (const modifierStatementId of coverageEntriesDescription.modifiersStatementIds) {
            if (statementCoverage[modifierStatementId]) {
                // Already detected as covered
                continue;
            }
            const modifierDescription = coverageEntriesDescription.statementMap[modifierStatementId];
            const enclosingFunction = _.find(coverageEntriesDescription.fnMap, functionDescription => sol_tracing_utils_1.utils.isRangeInside(modifierDescription, functionDescription.loc));
            const isModifierCovered = _.some(coverageEntriesDescription.statementMap, (statementDescription, statementId) => {
                const isInsideTheModifierEnclosingFunction = sol_tracing_utils_1.utils.isRangeInside(statementDescription, enclosingFunction.loc);
                const isCovered = statementCoverage[statementId];
                return isInsideTheModifierEnclosingFunction && isCovered;
            });
            const timesModifierCovered = Number(isModifierCovered);
            statementCoverage[modifierStatementId] = timesModifierCovered;
        }
        const partialCoverage = {
            [absoluteFileName]: Object.assign(Object.assign({}, coverageEntriesDescription), { path: absoluteFileName, f: functionCoverage, s: statementCoverage, b: branchCoverage }),
        };
        return partialCoverage;
    }
}
exports.CoverageSubprovider = CoverageSubprovider;
const IGNORE_REGEXP = /\/\*\s*solcov\s+ignore\s+next\s*\*\/\s*/gm;
//# sourceMappingURL=coverage_subprovider.js.map