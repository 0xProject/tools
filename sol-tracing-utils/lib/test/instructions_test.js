"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
require("mocha");
const constants_1 = require("../src/constants");
const instructions_1 = require("../src/instructions");
const expect = chai.expect;
describe('instructions', () => {
    describe('#getPcToInstructionIndexMapping', () => {
        it('correctly maps pcs to instruction indexed', () => {
            // tslint:disable-next-line:custom-no-magic-numbers
            const bytecode = new Uint8Array([constants_1.constants.PUSH1, 42, constants_1.constants.PUSH2, 1, 2, constants_1.constants.TIMESTAMP]);
            const pcToInstruction = instructions_1.getPcToInstructionIndexMapping(bytecode);
            const expectedPcToInstruction = { '0': 0, '2': 1, '5': 2 };
            expect(pcToInstruction).to.be.deep.equal(expectedPcToInstruction);
        });
    });
});
//# sourceMappingURL=instructions_test.js.map