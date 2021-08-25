"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = void 0;
const utils_1 = require("@0x/utils");
const ethereum_types_1 = require("ethereum-types");
const ethereumjs_util_1 = require("ethereumjs-util");
const _ = require("lodash");
const constants_1 = require("./constants");
const bytecodeToContractDataIfExists = {};
exports.utils = {
    compareLineColumn(lhs, rhs) {
        return lhs.line !== rhs.line ? lhs.line - rhs.line : lhs.column - rhs.column;
    },
    removeHexPrefix(hex) {
        const hexPrefix = '0x';
        return hex.startsWith(hexPrefix) ? hex.slice(hexPrefix.length) : hex;
    },
    isRangeInside(childRange, parentRange) {
        return (exports.utils.compareLineColumn(parentRange.start, childRange.start) <= 0 &&
            exports.utils.compareLineColumn(childRange.end, parentRange.end) <= 0);
    },
    isRangeEqual(childRange, parentRange) {
        return (exports.utils.compareLineColumn(parentRange.start, childRange.start) === 0 &&
            exports.utils.compareLineColumn(childRange.end, parentRange.end) === 0);
    },
    bytecodeToBytecodeRegex(bytecode) {
        const bytecodeRegex = bytecode
            // Library linking placeholder: __ConvertLib____________________________
            .replace(/_.*_/, '.*')
            // Last 86 characters is solidity compiler metadata that's different between compilations
            .replace(/.{86}$/, '')
            // Libraries contain their own address at the beginning of the code and it's impossible to know it in advance
            .replace(/^0x730000000000000000000000000000000000000000/, '0x73........................................');
        // HACK: Node regexes can't be longer that 32767 characters. Contracts bytecode can. We just truncate the regexes. It's safe in practice.
        const MAX_REGEX_LENGTH = 32767;
        const truncatedBytecodeRegex = bytecodeRegex.slice(0, MAX_REGEX_LENGTH);
        return truncatedBytecodeRegex;
    },
    getContractDataIfExists(contractsData, bytecode) {
        if (!bytecode.startsWith('0x')) {
            throw new Error(`0x hex prefix missing: ${bytecode}`);
        }
        // HACK(leo): We want to cache the values that are possibly undefined.
        // That's why we can't check for undefined as we usually do, but need to use `hasOwnProperty`.
        if (bytecodeToContractDataIfExists.hasOwnProperty(bytecode)) {
            return bytecodeToContractDataIfExists[bytecode];
        }
        const contractDataCandidates = _.filter(contractsData, contractDataCandidate => {
            const bytecodeRegex = exports.utils.bytecodeToBytecodeRegex(contractDataCandidate.bytecode);
            const runtimeBytecodeRegex = exports.utils.bytecodeToBytecodeRegex(contractDataCandidate.runtimeBytecode);
            // We use that function to find by bytecode or runtimeBytecode. Those are quasi-random strings so
            // collisions are practically impossible and it allows us to reuse that code
            return bytecode.match(bytecodeRegex) !== null || bytecode.match(runtimeBytecodeRegex) !== null;
        });
        if (contractDataCandidates.length > 1) {
            const candidates = contractDataCandidates.map(contractDataCandidate => _.values(contractDataCandidate.sources)[0]);
            const errMsg = "We've found more than one artifact that contains the exact same bytecode and therefore are unable to detect which contract was executed. " +
                "We'll be assigning all traces to the first one.";
            utils_1.logUtils.warn(errMsg);
            utils_1.logUtils.warn(candidates);
        }
        return (bytecodeToContractDataIfExists[bytecode] = contractDataCandidates[0]);
    },
    isCallLike(op) {
        return _.includes([ethereum_types_1.OpCode.CallCode, ethereum_types_1.OpCode.StaticCall, ethereum_types_1.OpCode.Call, ethereum_types_1.OpCode.DelegateCall], op);
    },
    isEndOpcode(op) {
        return _.includes([ethereum_types_1.OpCode.Return, ethereum_types_1.OpCode.Stop, ethereum_types_1.OpCode.Revert, ethereum_types_1.OpCode.Invalid, ethereum_types_1.OpCode.SelfDestruct], op);
    },
    getAddressFromStackEntry(stackEntry) {
        const hexBase = 16;
        return utils_1.addressUtils.padZeros(new utils_1.BigNumber(ethereumjs_util_1.addHexPrefix(stackEntry)).toString(hexBase));
    },
    normalizeStructLogs(structLogs) {
        if (_.isEmpty(structLogs)) {
            return structLogs;
        }
        const reduceDepthBy1 = (structLog) => (Object.assign(Object.assign({}, structLog), { depth: structLog.depth - 1 }));
        let normalizedStructLogs = structLogs;
        // HACK(leo): Geth traces sometimes returns those gas costs incorrectly as very big numbers so we manually fix them.
        const normalizeStaticCallCost = (structLog) => structLog.op === ethereum_types_1.OpCode.StaticCall
            ? Object.assign(Object.assign({}, structLog), { gasCost: constants_1.constants.opCodeToGasCost[structLog.op] }) : structLog;
        // HACK(leo): Geth traces sometimes returns those gas costs incorrectly as very big numbers so we manually fix them.
        const normalizeCallCost = (structLog, index) => {
            if (structLog.op === ethereum_types_1.OpCode.Call) {
                const callAddress = parseInt(structLog.stack[structLog.stack.length - constants_1.constants.opCodeToParamToStackOffset[ethereum_types_1.OpCode.Call].to - 1], constants_1.constants.HEX_BASE);
                const MAX_REASONABLE_PRECOMPILE_ADDRESS = 100;
                if (callAddress < MAX_REASONABLE_PRECOMPILE_ADDRESS) {
                    const nextStructLog = normalizedStructLogs[index + 1];
                    const gasCost = structLog.gas - nextStructLog.gas;
                    return Object.assign(Object.assign({}, structLog), { gasCost });
                }
                else {
                    return Object.assign(Object.assign({}, structLog), { gasCost: constants_1.constants.opCodeToGasCost[structLog.op] });
                }
            }
            else {
                return structLog;
            }
        };
        const shiftGasCosts1Left = (structLog, idx) => {
            if (idx === structLogs.length - 1) {
                return Object.assign(Object.assign({}, structLog), { gasCost: 0 });
            }
            else {
                const nextStructLog = structLogs[idx + 1];
                const gasCost = nextStructLog.gasCost;
                return Object.assign(Object.assign({}, structLog), { gasCost });
            }
        };
        if (structLogs[0].depth === 1) {
            // Geth uses 1-indexed depth counter whilst ganache starts from 0
            normalizedStructLogs = _.map(normalizedStructLogs, reduceDepthBy1);
            normalizedStructLogs = _.map(normalizedStructLogs, normalizeCallCost);
            normalizedStructLogs = _.map(normalizedStructLogs, normalizeStaticCallCost);
        }
        else {
            // Ganache shifts opcodes gas costs so we need to unshift them
            normalizedStructLogs = _.map(normalizedStructLogs, shiftGasCosts1Left);
        }
        return normalizedStructLogs;
    },
    getRange(sourceCode, range) {
        const lines = sourceCode.split('\n').slice(range.start.line - 1, range.end.line);
        lines[lines.length - 1] = lines[lines.length - 1].slice(0, range.end.column);
        lines[0] = lines[0].slice(range.start.column);
        return lines.join('\n');
    },
    shortenHex(hex, length) {
        return `${hex.substr(0, length + 2)}...${hex.substr(hex.length - length, length)}`;
    },
};
//# sourceMappingURL=utils.js.map