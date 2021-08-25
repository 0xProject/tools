"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const ethereum_types_1 = require("ethereum-types");
const _ = require("lodash");
require("mocha");
const trace_1 = require("../src/trace");
const expect = chai.expect;
const DEFAULT_STRUCT_LOG = {
    depth: 0,
    error: '',
    gas: 0,
    gasCost: 0,
    memory: [],
    op: ethereum_types_1.OpCode.Invalid,
    pc: 0,
    stack: [],
    storage: {},
};
function addDefaultStructLogFields(compactStructLog) {
    return Object.assign(Object.assign({}, DEFAULT_STRUCT_LOG), compactStructLog);
}
describe('Trace', () => {
    describe('#getTracesByContractAddress', () => {
        it('correctly splits trace by contract address', () => {
            const delegateCallAddress = '0x0000000000000000000000000000000000000002';
            const trace = [
                {
                    op: ethereum_types_1.OpCode.DelegateCall,
                    stack: [delegateCallAddress, '0x'],
                    depth: 0,
                },
                {
                    op: ethereum_types_1.OpCode.Return,
                    depth: 1,
                },
                {
                    op: ethereum_types_1.OpCode.Return,
                    depth: 0,
                },
            ];
            const fullTrace = _.map(trace, compactStructLog => addDefaultStructLogFields(compactStructLog));
            const startAddress = '0x0000000000000000000000000000000000000001';
            const traceByContractAddress = trace_1.getContractAddressToTraces(fullTrace, startAddress);
            const expectedTraceByContractAddress = {
                [startAddress]: [fullTrace[0], fullTrace[2]],
                [delegateCallAddress]: [fullTrace[1]],
            };
            expect(traceByContractAddress).to.be.deep.equal(expectedTraceByContractAddress);
        });
    });
});
//# sourceMappingURL=trace_test.js.map