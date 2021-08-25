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
require("mocha");
const src_1 = require("../src");
const expect = chai.expect;
describe('BlockchainLifecycle tests', () => {
    const provider = src_1.web3Factory.getRpcProvider({ shouldUseInProcessGanache: true });
    const web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider);
    const blockchainLifecycle = new src_1.BlockchainLifecycle(web3Wrapper);
    describe('#startAsync/revertAsync', () => {
        it('reverts changes in between', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockNumberBefore = yield web3Wrapper.getBlockNumberAsync();
            yield blockchainLifecycle.startAsync();
            yield web3Wrapper.mineBlockAsync();
            const blockNumberAfter = yield web3Wrapper.getBlockNumberAsync();
            // tslint:disable-next-line:restrict-plus-operands
            expect(blockNumberAfter).to.be.equal(blockNumberBefore + 1);
            yield blockchainLifecycle.revertAsync();
            const blockNumberAfterRevert = yield web3Wrapper.getBlockNumberAsync();
            expect(blockNumberAfterRevert).to.be.equal(blockNumberBefore);
        }));
    });
});
//# sourceMappingURL=blockchain_lifecycle_test.js.map