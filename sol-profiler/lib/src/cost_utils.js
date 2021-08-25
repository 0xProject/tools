"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.costUtils = void 0;
const sol_tracing_utils_1 = require("@0x/sol-tracing-utils");
const utils_1 = require("@0x/utils");
const ethereum_types_1 = require("ethereum-types");
const ethereumjs_util_1 = require("ethereumjs-util");
const _ = require("lodash");
const ZERO_BYTE_CALL_DATA_COST = 4;
const NON_ZERO_BYTE_CALL_DATA_COST = 16;
const WORD_SIZE = 32;
const G_MEMORY = 3;
const G_QUAD_COEF = 512;
const HEX_BASE = 16;
const G_COPY = 3;
exports.costUtils = {
    reportCallDataCost(traceInfo) {
        if (traceInfo.dataIfExists === undefined) {
            // No call data to report
            return 0;
        }
        const callData = traceInfo.dataIfExists;
        const callDataBuf = Buffer.from(ethereumjs_util_1.stripHexPrefix(callData), 'hex');
        const { true: zeroBytesCountIfExist, false: nonZeroBytesCountIfExist } = _.countBy(callDataBuf, byte => byte === 0);
        const zeroBytesCost = (zeroBytesCountIfExist || 0) * ZERO_BYTE_CALL_DATA_COST;
        const nonZeroBytesCost = (nonZeroBytesCountIfExist || 0) * NON_ZERO_BYTE_CALL_DATA_COST;
        const callDataCost = zeroBytesCost + nonZeroBytesCost;
        utils_1.logUtils.header('Call data breakdown', '-');
        utils_1.logUtils.table({
            'call data size (bytes)': callDataBuf.byteLength,
            callDataCost,
            zeroBytesCost,
            nonZeroBytesCost,
            zeroBytesCountIfExist,
            nonZeroBytesCountIfExist,
        });
        return callDataCost;
    },
    reportMemoryCost(traceInfo) {
        const structLogs = traceInfo.trace.structLogs;
        const MEMORY_OPCODES = [ethereum_types_1.OpCode.MLoad, ethereum_types_1.OpCode.MStore, ethereum_types_1.OpCode.MStore8];
        const CALL_DATA_OPCODES = [ethereum_types_1.OpCode.CallDataCopy];
        const memoryLogs = _.filter(structLogs, structLog => _.includes([...MEMORY_OPCODES, ...CALL_DATA_OPCODES], structLog.op));
        const memoryLocationsAccessed = _.map(memoryLogs, structLog => {
            if (_.includes(CALL_DATA_OPCODES, structLog.op)) {
                const memoryOffsetStackOffset = sol_tracing_utils_1.constants.opCodeToParamToStackOffset[structLog.op].memoryOffset;
                const lengthStackOffset = sol_tracing_utils_1.constants.opCodeToParamToStackOffset[structLog.op].length;
                const memOffset = parseInt(structLog.stack[structLog.stack.length - memoryOffsetStackOffset - 1], HEX_BASE);
                const length = parseInt(structLog.stack[structLog.stack.length - lengthStackOffset - 1], HEX_BASE);
                return memOffset + length;
            }
            else {
                const memoryLocationStackOffset = sol_tracing_utils_1.constants.opCodeToParamToStackOffset[structLog.op].offset;
                return parseInt(structLog.stack[structLog.stack.length - memoryLocationStackOffset - 1], HEX_BASE);
            }
        });
        const highestMemoryLocationAccessed = _.max(memoryLocationsAccessed);
        return exports.costUtils._printMemoryCost(highestMemoryLocationAccessed);
    },
    reportCopyingCost(traceInfo) {
        const structLogs = traceInfo.trace.structLogs;
        const COPY_OPCODES = [ethereum_types_1.OpCode.CallDataCopy];
        const copyLogs = _.filter(structLogs, structLog => _.includes(COPY_OPCODES, structLog.op));
        const copyCosts = _.map(copyLogs, structLog => {
            const lengthStackOffset = sol_tracing_utils_1.constants.opCodeToParamToStackOffset[structLog.op].length;
            const length = parseInt(structLog.stack[structLog.stack.length - lengthStackOffset - 1], HEX_BASE);
            return Math.ceil(length / WORD_SIZE) * G_COPY;
        });
        return _.sum(copyCosts);
    },
    reportOpcodesCost(traceInfo) {
        const structLogs = traceInfo.trace.structLogs;
        const gasCosts = _.map(structLogs, structLog => structLog.gasCost);
        const gasCost = _.sum(gasCosts);
        return gasCost;
    },
    _printMemoryCost(highestMemoryLocationAccessed) {
        if (highestMemoryLocationAccessed === undefined) {
            return 0;
        }
        const memoryWordsUsed = Math.ceil((highestMemoryLocationAccessed + WORD_SIZE) / WORD_SIZE);
        const linearMemoryCost = G_MEMORY * memoryWordsUsed;
        const quadraticMemoryCost = Math.floor((memoryWordsUsed * memoryWordsUsed) / G_QUAD_COEF);
        const memoryCost = linearMemoryCost + quadraticMemoryCost;
        utils_1.logUtils.header('Memory breakdown', '-');
        utils_1.logUtils.table({
            'memoryCost = linearMemoryCost + quadraticMemoryCost': memoryCost,
            linearMemoryCost,
            quadraticMemoryCost,
            highestMemoryLocationAccessed,
            memoryWordsUsed,
        });
        return memoryCost;
    },
};
//# sourceMappingURL=cost_utils.js.map