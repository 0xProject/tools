"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@0x/utils");
const chai = require("chai");
require("mocha");
const utils_2 = require("../src/utils");
const { expect } = chai;
describe('Utils tests', () => {
    describe('#formatABIDataItem', () => {
        it('correctly handles arrays', () => {
            const calls = [];
            const abi = {
                name: 'values',
                type: 'uint256[]',
            };
            const val = [1, 2, 3];
            const formatted = utils_2.formatABIDataItem(abi, val, (type, value) => {
                calls.push({ type, value });
                return value; // no-op
            });
            expect(formatted).to.be.deep.equal(val);
            expect(calls).to.be.deep.equal([
                { type: 'uint256', value: 1 },
                { type: 'uint256', value: 2 },
                { type: 'uint256', value: 3 },
            ]);
        });
        it('correctly handles tuples', () => {
            const calls = [];
            const abi = {
                components: [
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: 'amount',
                        type: 'uint256',
                    },
                ],
                name: 'data',
                type: 'tuple',
            };
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
            const val = { to: ZERO_ADDRESS, amount: new utils_1.BigNumber(1) };
            const formatted = utils_2.formatABIDataItem(abi, val, (type, value) => {
                calls.push({ type, value });
                return value; // no-op
            });
            expect(formatted).to.be.deep.equal(val);
            expect(calls).to.be.deep.equal([
                {
                    type: 'address',
                    value: val.to,
                },
                {
                    type: 'uint256',
                    value: val.amount,
                },
            ]);
        });
        it('correctly handles nested arrays of tuples', () => {
            const calls = [];
            const abi = {
                components: [
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: 'amount',
                        type: 'uint256',
                    },
                ],
                name: 'data',
                type: 'tuple[2][]',
            };
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
            const val = [
                [{ to: ZERO_ADDRESS, amount: new utils_1.BigNumber(1) }, { to: ZERO_ADDRESS, amount: new utils_1.BigNumber(2) }],
            ];
            const formatted = utils_2.formatABIDataItem(abi, val, (type, value) => {
                calls.push({ type, value });
                return value; // no-op
            });
            expect(formatted).to.be.deep.equal(val);
            expect(calls).to.be.deep.equal([
                {
                    type: 'address',
                    value: val[0][0].to,
                },
                {
                    type: 'uint256',
                    value: val[0][0].amount,
                },
                {
                    type: 'address',
                    value: val[0][1].to,
                },
                {
                    type: 'uint256',
                    value: val[0][1].amount,
                },
            ]);
        });
    });
});
//# sourceMappingURL=utils_test.js.map