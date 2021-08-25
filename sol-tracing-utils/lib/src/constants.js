"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
const ethereum_types_1 = require("ethereum-types");
const opCodeToParamToStackOffset = {
    [ethereum_types_1.OpCode.Call]: {
        gas: 0,
        to: 1,
        value: 1,
    },
    [ethereum_types_1.OpCode.MLoad]: { offset: 0 },
    [ethereum_types_1.OpCode.MStore]: { offset: 0 },
    [ethereum_types_1.OpCode.MStore8]: { offset: 0 },
    [ethereum_types_1.OpCode.CallDataCopy]: { memoryOffset: 0, callDataOffset: 1, length: 2 },
};
const opCodeToGasCost = {
    [ethereum_types_1.OpCode.Call]: 700,
    [ethereum_types_1.OpCode.StaticCall]: 40,
};
// tslint:disable:number-literal-format
exports.constants = {
    NEW_CONTRACT: 'NEW_CONTRACT',
    HEX_BASE: 16,
    PUSH1: 0x60,
    PUSH2: 0x61,
    PUSH32: 0x7f,
    TIMESTAMP: 0x42,
    opCodeToGasCost,
    opCodeToParamToStackOffset,
};
//# sourceMappingURL=constants.js.map