"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
require("mocha");
const src_1 = require("../src");
const expect = chai.expect;
describe('abiUtils', () => {
    describe('splitTupleTypes', () => {
        it('handles basic types', () => {
            const got = src_1.abiUtils.splitTupleTypes('tuple(bytes,uint256,address)');
            expect(got).to.deep.equal(['bytes', 'uint256', 'address']);
        });
        it('handles nested tuple types', () => {
            const got = src_1.abiUtils.splitTupleTypes('tuple(tuple(bytes,uint256),address)');
            expect(got).to.deep.equal(['tuple(bytes,uint256)', 'address']);
        });
    });
});
//# sourceMappingURL=abi_utils_test.js.map