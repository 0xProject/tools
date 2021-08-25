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
const chai = require("chai");
const chai_setup_1 = require("../chai_setup");
const fixture_data_1 = require("../utils/fixture_data");
const debug_subprovider_1 = require("./../../src/subproviders/debug_subprovider");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
// tslint:disable-next-line: no-unbound-method
const fail = chai.assert.fail;
const blankCallback = () => {
    return;
};
describe('DebugSubprovider', () => {
    describe('sends debug message to callback', () => __awaiter(void 0, void 0, void 0, function* () {
        let sentDebugData;
        const debugCallback = (curDebugData) => {
            sentDebugData = curDebugData;
            return;
        };
        before(() => {
            sentDebugData = undefined;
        });
        it('for ERC20 transfer', () => __awaiter(void 0, void 0, void 0, function* () {
            const fixtureRpcPayload = fixture_data_1.fixtureData.ERC20_TRANSFER_RPC_PAYLOAD;
            const debugSubprovider = new debug_subprovider_1.DebugSubprovider(debugCallback);
            yield debugSubprovider.handleRequest(fixtureRpcPayload, blankCallback, blankCallback);
            if (!sentDebugData) {
                fail('No debug data sent');
            }
            else {
                expect(sentDebugData.id).to.eql(fixtureRpcPayload.id);
                expect(sentDebugData.jsonrpc).to.eql(fixtureRpcPayload.jsonrpc);
                expect(sentDebugData.params).to.eql(fixtureRpcPayload.params);
                expect(sentDebugData.method).to.eql(fixtureRpcPayload.method);
                const rawTxnAttrs = sentDebugData.rawTransactionAttributes;
                if (!rawTxnAttrs) {
                    fail('No rawTransactionAttributes');
                }
                else {
                    expect(rawTxnAttrs.gasLimit).to.eql('37428');
                    expect(rawTxnAttrs.gasPrice).to.eql('1000000000');
                    expect(rawTxnAttrs.nonce).to.eql('32');
                    expect(rawTxnAttrs.value).to.eql('0');
                    expect(rawTxnAttrs.to).to.eql('0x2002d3812f58e35f0ea1ffbf80a75a38c32175fa');
                }
            }
        }));
        it('for eth_blockNumber command', () => __awaiter(void 0, void 0, void 0, function* () {
            const fixtureRpcPayload = fixture_data_1.fixtureData.ETH_GETBLOCK_RPC_PAYLOAD;
            const debugSubprovider = new debug_subprovider_1.DebugSubprovider(debugCallback);
            yield debugSubprovider.handleRequest(fixtureRpcPayload, blankCallback, blankCallback);
            if (!sentDebugData) {
                fail('No debug data sent');
            }
            else {
                expect(sentDebugData).to.eql(fixtureRpcPayload);
            }
        }));
        it('for regular ETH transfer', () => __awaiter(void 0, void 0, void 0, function* () {
            const fixtureRpcPayload = fixture_data_1.fixtureData.ETH_TRANSFER_PAYLOAD;
            const debugSubprovider = new debug_subprovider_1.DebugSubprovider(debugCallback);
            yield debugSubprovider.handleRequest(fixtureRpcPayload, blankCallback, blankCallback);
            if (!sentDebugData) {
                fail('No debug data sent');
            }
            else {
                expect(sentDebugData.id).to.eql(fixtureRpcPayload.id);
                expect(sentDebugData.jsonrpc).to.eql(fixtureRpcPayload.jsonrpc);
                expect(sentDebugData.params).to.eql(fixtureRpcPayload.params);
                expect(sentDebugData.method).to.eql(fixtureRpcPayload.method);
                const rawTxnAttrs = sentDebugData.rawTransactionAttributes;
                if (!rawTxnAttrs) {
                    fail('No rawTransactionAttributes');
                }
                else {
                    expect(rawTxnAttrs.gasLimit).to.eql('21000');
                    expect(rawTxnAttrs.gasPrice).to.eql('8000000000');
                    expect(rawTxnAttrs.nonce).to.eql('38');
                    expect(rawTxnAttrs.value).to.eql('410000000000000');
                    expect(rawTxnAttrs.to).to.eql('0x8a333a18b924554d6e83ef9e9944de6260f61d3b');
                }
            }
        }));
    }));
});
//# sourceMappingURL=debug_subprovider_test.js.map