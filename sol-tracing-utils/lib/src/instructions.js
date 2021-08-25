"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPcToInstructionIndexMapping = void 0;
const constants_1 = require("./constants");
const isPush = (inst) => inst >= constants_1.constants.PUSH1 && inst <= constants_1.constants.PUSH32;
const pushDataLength = (inst) => inst - constants_1.constants.PUSH1 + 1;
const instructionLength = (inst) => (isPush(inst) ? pushDataLength(inst) + 1 : 1);
const getPcToInstructionIndexMapping = (bytecode) => {
    const result = {};
    let byteIndex = 0;
    let instructionIndex = 0;
    while (byteIndex < bytecode.length) {
        const instruction = bytecode[byteIndex];
        const length = instructionLength(instruction);
        result[byteIndex] = instructionIndex;
        byteIndex += length;
        instructionIndex += 1;
    }
    return result;
};
exports.getPcToInstructionIndexMapping = getPcToInstructionIndexMapping;
//# sourceMappingURL=instructions.js.map