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
const web3_wrapper_1 = require("@0x/web3-wrapper");
const chai = require("chai");
const ethereum_types_1 = require("ethereum-types");
require("mocha");
const src_1 = require("../src");
const expect = chai.expect;
describe('RPC tests', () => {
    const provider = src_1.web3Factory.getRpcProvider({ shouldUseInProcessGanache: true });
    const web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider);
    describe('#mineBlockAsync', () => {
        it('increases block number when called', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockNumberBefore = yield web3Wrapper.getBlockNumberAsync();
            yield web3Wrapper.mineBlockAsync();
            const blockNumberAfter = yield web3Wrapper.getBlockNumberAsync();
            // tslint:disable-next-line:restrict-plus-operands
            expect(blockNumberAfter).to.be.equal(blockNumberBefore + 1);
        }));
    });
    describe('#increaseTimeAsync', () => {
        it('increases time when called', () => __awaiter(void 0, void 0, void 0, function* () {
            const TIME_DELTA = 1000;
            const blockTimestampBefore = yield web3Wrapper.getBlockTimestampAsync(ethereum_types_1.BlockParamLiteral.Latest);
            yield web3Wrapper.increaseTimeAsync(TIME_DELTA);
            yield web3Wrapper.mineBlockAsync();
            const blockTimestampAfter = yield web3Wrapper.getBlockTimestampAsync(ethereum_types_1.BlockParamLiteral.Latest);
            // tslint:disable-next-line:restrict-plus-operands
            expect(blockTimestampAfter).to.be.at.least(blockTimestampBefore + TIME_DELTA);
        }));
    });
    describe('#takeSnapshotAsync/revertSnapshotAsync', () => {
        it('reverts changes in between', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockNumberBefore = yield web3Wrapper.getBlockNumberAsync();
            const snapshotId = yield web3Wrapper.takeSnapshotAsync();
            yield web3Wrapper.mineBlockAsync();
            yield web3Wrapper.revertSnapshotAsync(snapshotId);
            const blockNumberAfter = yield web3Wrapper.getBlockNumberAsync();
            expect(blockNumberAfter).to.be.equal(blockNumberBefore);
        }));
    });
});
//# sourceMappingURL=rpc_test.js.map