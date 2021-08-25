"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@0x/utils");
const chai = require("chai");
const Sinon = require("sinon");
const src_1 = require("../../src");
const chai_setup_1 = require("../chai_setup");
const ganache_subprovider_1 = require("../utils/ganache_subprovider");
const report_callback_errors_1 = require("../utils/report_callback_errors");
const expect = chai.expect;
chai_setup_1.chaiSetup.configure();
const DEFAULT_NUM_ACCOUNTS = 10;
describe('RedundantSubprovider', () => {
    let provider;
    it('succeeds when supplied a healthy endpoint', (done) => {
        provider = new src_1.Web3ProviderEngine();
        const subproviders = [ganache_subprovider_1.ganacheSubprovider];
        const redundantSubprovider = new src_1.RedundantSubprovider(subproviders);
        provider.addProvider(redundantSubprovider);
        utils_1.providerUtils.startProviderEngine(provider);
        const payload = {
            jsonrpc: '2.0',
            method: 'eth_accounts',
            params: [],
            id: 1,
        };
        const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
            expect(err).to.be.a('null');
            expect(response.result.length).to.be.equal(DEFAULT_NUM_ACCOUNTS);
            done();
        });
        provider.sendAsync(payload, callback);
    });
    it('succeeds when supplied at least one healthy endpoint', (done) => {
        provider = new src_1.Web3ProviderEngine();
        const nonExistentSubprovider = new src_1.RPCSubprovider('http://does-not-exist:3000');
        const handleRequestStub = Sinon.stub(nonExistentSubprovider, 'handleRequest').throws(new Error('REQUEST_FAILED'));
        const subproviders = [nonExistentSubprovider, ganache_subprovider_1.ganacheSubprovider];
        const redundantSubprovider = new src_1.RedundantSubprovider(subproviders);
        provider.addProvider(redundantSubprovider);
        utils_1.providerUtils.startProviderEngine(provider);
        const payload = {
            jsonrpc: '2.0',
            method: 'eth_accounts',
            params: [],
            id: 1,
        };
        const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
            expect(err).to.be.a('null');
            expect(response.result.length).to.be.equal(DEFAULT_NUM_ACCOUNTS);
            handleRequestStub.restore();
            done();
        });
        provider.sendAsync(payload, callback);
    });
});
//# sourceMappingURL=redundant_rpc_subprovider_test.js.map