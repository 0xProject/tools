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
const util_1 = require("util");
const FixtureSubprovider = require("web3-provider-engine/subproviders/fixture");
const utils_1 = require("@0x/utils");
const tx_1 = require("@ethereumjs/tx");
const src_1 = require("../../src");
const chai_setup_1 = require("../chai_setup");
const expect = chai.expect;
chai_setup_1.chaiSetup.configure();
describe('NonceTrackerSubprovider', () => {
    let provider;
    const getTransactionCountPayload = {
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: ['0x0', 'pending'],
        id: 1,
    };
    const sendTransactionPayload = {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [],
        id: 1,
    };
    const txParams = {
        nonce: '0x',
        gasPrice: '0x09184e72a000',
        gasLimit: '0x2710',
        to: '0x0000000000000000000000000000000000000000',
        value: '0x',
        data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        v: '0x1c',
        r: '0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
        s: '0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13',
    };
    function createFixtureSubprovider() {
        let isFirstGetTransactionCount = true;
        const fixedBlockNumberAndTransactionCountProvider = new FixtureSubprovider({
            eth_getBlockByNumber: '0x01',
            eth_getTransactionCount: (_data, _next, end) => {
                // For testing caching we return different results on the second call
                if (isFirstGetTransactionCount) {
                    isFirstGetTransactionCount = false;
                    end(null, '0x00');
                }
                else {
                    end(null, '0x99');
                }
            },
        });
        return fixedBlockNumberAndTransactionCountProvider;
    }
    it('successfully caches the transaction count', () => __awaiter(void 0, void 0, void 0, function* () {
        provider = new src_1.Web3ProviderEngine();
        const nonceTrackerSubprovider = new src_1.NonceTrackerSubprovider();
        provider.addProvider(nonceTrackerSubprovider);
        provider.addProvider(createFixtureSubprovider());
        utils_1.providerUtils.startProviderEngine(provider);
        const payload = Object.assign(Object.assign({}, getTransactionCountPayload), { params: ['0x0', 'pending'] });
        const sendAsync = util_1.promisify(provider.sendAsync.bind(provider));
        const response = yield sendAsync(payload);
        expect(response.result).to.be.eq('0x00');
        const secondResponse = yield sendAsync(payload);
        expect(secondResponse.result).to.be.eq('0x00');
    }));
    it('does not cache the result for latest transaction count', () => __awaiter(void 0, void 0, void 0, function* () {
        provider = new src_1.Web3ProviderEngine();
        const nonceTrackerSubprovider = new src_1.NonceTrackerSubprovider();
        provider.addProvider(nonceTrackerSubprovider);
        provider.addProvider(createFixtureSubprovider());
        utils_1.providerUtils.startProviderEngine(provider);
        const payload = Object.assign(Object.assign({}, getTransactionCountPayload), { params: ['0x0', 'latest'] });
        const sendAsync = util_1.promisify(provider.sendAsync.bind(provider));
        const response = yield sendAsync(payload);
        expect(response.result).to.be.eq('0x00');
        const secondResponse = yield sendAsync(payload);
        expect(secondResponse.result).to.be.eq('0x99');
    }));
    it('clears the cache on a Nonce Too Low Error', () => __awaiter(void 0, void 0, void 0, function* () {
        provider = new src_1.Web3ProviderEngine();
        const nonceTrackerSubprovider = new src_1.NonceTrackerSubprovider();
        provider.addProvider(nonceTrackerSubprovider);
        provider.addProvider(createFixtureSubprovider());
        provider.addProvider(new FixtureSubprovider({
            eth_sendRawTransaction: (_data, _next, end) => {
                end(new Error('Transaction nonce is too low'));
            },
        }));
        utils_1.providerUtils.startProviderEngine(provider);
        const noncePayload = Object.assign(Object.assign({}, getTransactionCountPayload), { params: ['0x1f36f546477cda21bf2296c50976f2740247906f', 'pending'] });
        const transaction = tx_1.TransactionFactory.fromTxData(txParams);
        const txPayload = Object.assign(Object.assign({}, sendTransactionPayload), { params: [transaction.serialize()] });
        const sendAsync = util_1.promisify(provider.sendAsync.bind(provider));
        const response = yield sendAsync(noncePayload);
        expect(response.result).to.be.eq('0x00');
        const secondResponse = yield sendAsync(noncePayload);
        expect(secondResponse.result).to.be.eq('0x00');
        try {
            yield util_1.promisify(provider.sendAsync.bind(provider))(txPayload);
        }
        catch (err) {
            const thirdResponse = yield sendAsync(noncePayload);
            expect(thirdResponse.result).to.be.eq('0x99');
        }
    }));
    it('increments the used nonce when a transaction successfully submits', () => __awaiter(void 0, void 0, void 0, function* () {
        provider = new src_1.Web3ProviderEngine();
        const nonceTrackerSubprovider = new src_1.NonceTrackerSubprovider();
        provider.addProvider(nonceTrackerSubprovider);
        provider.addProvider(createFixtureSubprovider());
        provider.addProvider(new FixtureSubprovider({
            eth_sendRawTransaction: (_data, _next, end) => {
                end(null);
            },
        }));
        utils_1.providerUtils.startProviderEngine(provider);
        const noncePayload = Object.assign(Object.assign({}, getTransactionCountPayload), { params: ['0x1f36f546477cda21bf2296c50976f2740247906f', 'pending'] });
        const transaction = tx_1.TransactionFactory.fromTxData(txParams);
        const txPayload = Object.assign(Object.assign({}, sendTransactionPayload), { params: [transaction.serialize()] });
        const sendAsync = util_1.promisify(provider.sendAsync.bind(provider));
        const response = yield sendAsync(noncePayload);
        expect(response.result).to.be.eq('0x00');
        const secondResponse = yield sendAsync(noncePayload);
        expect(secondResponse.result).to.be.eq('0x00');
        yield util_1.promisify(provider.sendAsync.bind(provider))(txPayload);
        const thirdResponse = yield sendAsync(noncePayload);
        expect(thirdResponse.result).to.be.eq('0x01');
    }));
});
//# sourceMappingURL=nonce_tracker_subprovider_test.js.map