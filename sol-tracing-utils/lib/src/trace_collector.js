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
exports.TraceCollector = void 0;
const chalk_1 = require("chalk");
const ethereumjs_util_1 = require("ethereumjs-util");
const fs = require("fs");
const istanbul_1 = require("istanbul");
const _ = require("lodash");
const loglevel_1 = require("loglevel");
const mkdirp = require("mkdirp");
const util_1 = require("util");
const constants_1 = require("./constants");
const source_maps_1 = require("./source_maps");
const utils_1 = require("./utils");
const mkdirpAsync = util_1.promisify(mkdirp);
/**
 * TraceCollector is used by CoverageSubprovider to compute code coverage based on collected trace data.
 */
class TraceCollector {
    /**
     * Instantiates a TraceCollector instance
     * @param artifactAdapter Adapter for used artifacts format (0x, truffle, giveth, etc.)
     * @param isVerbose If true, we will log any unknown transactions. Otherwise we will ignore them
     * @param singleFileSubtraceHandler A handler function for computing partial coverage for a single file & subtrace
     */
    constructor(artifactAdapter, isVerbose, singleFileSubtraceHandler) {
        this._collector = new istanbul_1.Collector();
        this._artifactAdapter = artifactAdapter;
        this._logger = loglevel_1.getLogger('sol-tracing-utils');
        this._logger.setLevel(isVerbose ? loglevel_1.levels.TRACE : loglevel_1.levels.ERROR);
        this._singleFileSubtraceHandler = singleFileSubtraceHandler;
    }
    writeOutputAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const finalCoverage = this._collector.getFinalCoverage();
            const stringifiedCoverage = JSON.stringify(finalCoverage, null, '\t');
            yield mkdirpAsync('coverage');
            fs.writeFileSync('coverage/coverage.json', stringifiedCoverage);
        });
    }
    getContractDataByTraceInfoIfExistsAsync(address, bytecode, isContractCreation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._contractsData === undefined) {
                this._contractsData = yield this._artifactAdapter.collectContractsDataAsync();
            }
            const contractData = utils_1.utils.getContractDataIfExists(this._contractsData, bytecode);
            if (contractData === undefined) {
                /**
                 * Length chooses so that both error messages are of the same length
                 * and it's enough data to figure out which artifact has a problem.
                 */
                const HEX_LENGTH = 16;
                const errMsg = isContractCreation
                    ? `Unable to find matching bytecode for contract creation ${chalk_1.default.bold(utils_1.utils.shortenHex(bytecode, HEX_LENGTH))}, please check your artifacts. Ignoring...`
                    : `Unable to find matching bytecode for contract address ${chalk_1.default.bold(address)}, please check your artifacts. Ignoring...`;
                this._logger.warn(errMsg);
            }
            return contractData;
        });
    }
    computeSingleTraceCoverageAsync(subTraceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const isContractCreation = subTraceInfo.address === constants_1.constants.NEW_CONTRACT;
            const bytecode = isContractCreation
                ? subTraceInfo.bytecode
                : subTraceInfo.runtimeBytecode;
            const contractData = yield this.getContractDataByTraceInfoIfExistsAsync(subTraceInfo.address, bytecode, isContractCreation);
            if (contractData === undefined) {
                return;
            }
            const bytecodeHex = ethereumjs_util_1.stripHexPrefix(bytecode);
            const sourceMap = isContractCreation ? contractData.sourceMap : contractData.sourceMapRuntime;
            const pcToSourceRange = source_maps_1.parseSourceMap(contractData.sourceCodes, sourceMap, bytecodeHex, contractData.sources);
            _.map(contractData.sources, (_sourcePath, fileIndex) => {
                const singleFileCoverageForTrace = this._singleFileSubtraceHandler(contractData, subTraceInfo.subtrace, pcToSourceRange, _.parseInt(fileIndex));
                this._collector.add(singleFileCoverageForTrace);
            });
        });
    }
}
exports.TraceCollector = TraceCollector;
//# sourceMappingURL=trace_collector.js.map