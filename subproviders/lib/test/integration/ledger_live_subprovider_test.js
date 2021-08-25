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
const utils_1 = require("@0x/utils");
const hw_app_eth_1 = require("@ledgerhq/hw-app-eth");
// HACK: This dependency is optional and tslint skips optional dependencies
// tslint:disable-next-line:no-implicit-dependencies
const hw_transport_node_hid_singleton_1 = require("@ledgerhq/hw-transport-node-hid-singleton");
const chai = require("chai");
const ethUtils = require("ethereumjs-util");
const src_1 = require("../../src");
const chai_setup_1 = require("../chai_setup");
const fixture_data_1 = require("../utils/fixture_data");
const report_callback_errors_1 = require("../utils/report_callback_errors");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const DEFAULT_NUM_ACCOUNTS = 10;
const EXPECTED_SIGNATURE_LENGTH = 132;
function ledgerEthereumNodeJsClientFactoryAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        const ledgerConnection = yield hw_transport_node_hid_singleton_1.default.create();
        const ledgerEthClient = new hw_app_eth_1.default(ledgerConnection);
        return ledgerEthClient;
    });
}
describe('LedgerSubprovider', () => {
    let ledgerSubprovider;
    const networkId = fixture_data_1.fixtureData.NETWORK_ID;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        ledgerSubprovider = new src_1.LedgerSubprovider({
            networkId,
            ledgerEthereumClientFactoryAsync: ledgerEthereumNodeJsClientFactoryAsync,
            baseDerivationPath: fixture_data_1.fixtureData.TEST_RPC_LEDGER_LIVE_DERIVATION_PATH,
        });
    }));
    describe('direct method calls', () => {
        it('returns default number of accounts', () => __awaiter(void 0, void 0, void 0, function* () {
            const accounts = yield ledgerSubprovider.getAccountsAsync();
            expect(accounts[0]).to.not.be.an('undefined');
            expect(accounts.length).to.be.equal(DEFAULT_NUM_ACCOUNTS);
        }));
        it('returns the expected accounts from a ledger set up with the test mnemonic', () => __awaiter(void 0, void 0, void 0, function* () {
            const accounts = yield ledgerSubprovider.getAccountsAsync(2);
            expect(accounts[0]).to.be.equal(fixture_data_1.fixtureData.TEST_RPC_LEDGER_LIVE_ACCOUNT_0);
            expect(accounts[1]).to.be.equal(fixture_data_1.fixtureData.TEST_RPC_LEDGER_LIVE_ACCOUNT_1);
        }));
        it('returns requested number of accounts', () => __awaiter(void 0, void 0, void 0, function* () {
            const numberOfAccounts = 20;
            const accounts = yield ledgerSubprovider.getAccountsAsync(numberOfAccounts);
            expect(accounts[0]).to.not.be.an('undefined');
            expect(accounts.length).to.be.equal(numberOfAccounts);
        }));
        it('signs a personal message', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = ethUtils.bufferToHex(Buffer.from(fixture_data_1.fixtureData.PERSONAL_MESSAGE_STRING));
            const ecSignatureHex = yield ledgerSubprovider.signPersonalMessageAsync(data, fixture_data_1.fixtureData.TEST_RPC_LEDGER_LIVE_ACCOUNT_0);
            expect(ecSignatureHex).to.be.equal(fixture_data_1.fixtureData.PERSONAL_MESSAGE_SIGNED_RESULT);
        }));
        it('signs a personal utf8 message', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = ethUtils.bufferToHex(Buffer.from(fixture_data_1.fixtureData.PERSONAL_MESSAGE_STRING_UTF8));
            const ecSignatureHex = yield ledgerSubprovider.signPersonalMessageAsync(data, fixture_data_1.fixtureData.TEST_RPC_LEDGER_LIVE_ACCOUNT_0);
            expect(ecSignatureHex).to.be.equal(fixture_data_1.fixtureData.PERSONAL_MESSAGE_UTF8_LEDGER_SIGNED_RESULT);
        }));
        it('signs a personal message with second address', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = ethUtils.bufferToHex(Buffer.from(fixture_data_1.fixtureData.PERSONAL_MESSAGE_STRING));
            const ecSignatureHex = yield ledgerSubprovider.signPersonalMessageAsync(data, fixture_data_1.fixtureData.TEST_RPC_LEDGER_LIVE_ACCOUNT_1);
            expect(ecSignatureHex).to.be.equal(fixture_data_1.fixtureData.PERSONAL_MESSAGE_LEDGER_LIVE_ACCOUNT_1_SIGNED_RESULT);
        }));
        it('signs a transaction', () => __awaiter(void 0, void 0, void 0, function* () {
            const txHex = yield ledgerSubprovider.signTransactionAsync(fixture_data_1.fixtureData.TX_DATA);
            expect(txHex).to.be.equal(fixture_data_1.fixtureData.TX_DATA_SIGNED_RESULT);
        }));
        it('signs a transaction with the second address', () => __awaiter(void 0, void 0, void 0, function* () {
            const txData = Object.assign(Object.assign({}, fixture_data_1.fixtureData.TX_DATA), { from: fixture_data_1.fixtureData.TEST_RPC_LEDGER_LIVE_ACCOUNT_1 });
            const txHex = yield ledgerSubprovider.signTransactionAsync(txData);
            expect(txHex).to.be.equal(fixture_data_1.fixtureData.TX_DATA_LEDGER_LIVE_ACCOUNT_1_SIGNED_RESULT);
        }));
    });
    describe('calls through a provider', () => {
        let defaultProvider;
        let ledgerProvider;
        before(() => {
            ledgerProvider = new src_1.Web3ProviderEngine();
            ledgerProvider.addProvider(ledgerSubprovider);
            const httpProvider = new src_1.RPCSubprovider('http://localhost:8545');
            ledgerProvider.addProvider(httpProvider);
            utils_1.providerUtils.startProviderEngine(ledgerProvider);
            defaultProvider = new src_1.Web3ProviderEngine();
            defaultProvider.addProvider(httpProvider);
            utils_1.providerUtils.startProviderEngine(defaultProvider);
        });
        it('returns a list of accounts', (done) => {
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
            ledgerProvider.sendAsync(payload, callback);
        });
        it('signs a personal message with eth_sign', (done) => {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const messageHex = ethUtils.bufferToHex(Buffer.from(fixture_data_1.fixtureData.PERSONAL_MESSAGE_STRING));
                const accounts = yield ledgerSubprovider.getAccountsAsync();
                const signer = accounts[0];
                const payload = {
                    jsonrpc: '2.0',
                    method: 'eth_sign',
                    params: [signer, messageHex],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
                    expect(err).to.be.a('null');
                    expect(response.result.length).to.be.equal(EXPECTED_SIGNATURE_LENGTH);
                    expect(response.result.substr(0, 2)).to.be.equal('0x');
                    done();
                });
                ledgerProvider.sendAsync(payload, callback);
            }))().catch(done);
        });
        it('signs a personal message with personal_sign', (done) => {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const messageHex = ethUtils.bufferToHex(Buffer.from(fixture_data_1.fixtureData.PERSONAL_MESSAGE_STRING));
                const accounts = yield ledgerSubprovider.getAccountsAsync();
                const signer = accounts[0];
                const payload = {
                    jsonrpc: '2.0',
                    method: 'personal_sign',
                    params: [messageHex, signer],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
                    expect(err).to.be.a('null');
                    expect(response.result.length).to.be.equal(EXPECTED_SIGNATURE_LENGTH);
                    expect(response.result.substr(0, 2)).to.be.equal('0x');
                    done();
                });
                ledgerProvider.sendAsync(payload, callback);
            }))().catch(done);
        });
        it('signs a transaction', (done) => {
            const payload = {
                jsonrpc: '2.0',
                method: 'eth_signTransaction',
                params: [fixture_data_1.fixtureData.TX_DATA],
                id: 1,
            };
            const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
                expect(err).to.be.a('null');
                expect(response.result.raw).to.be.equal(fixture_data_1.fixtureData.TX_DATA_SIGNED_RESULT);
                done();
            });
            ledgerProvider.sendAsync(payload, callback);
        });
        it('signs and sends a transaction', (done) => {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const accounts = yield ledgerSubprovider.getAccountsAsync();
                // Give first account on Ledger sufficient ETH to complete tx send
                let tx = {
                    to: accounts[0],
                    from: fixture_data_1.fixtureData.TEST_RPC_ACCOUNT_0,
                    value: '0x8ac7230489e80000', // 10 ETH
                };
                let payload = {
                    jsonrpc: '2.0',
                    method: 'eth_sendTransaction',
                    params: [tx],
                    id: 1,
                };
                yield utils_1.promisify(defaultProvider.sendAsync.bind(defaultProvider))(payload);
                // Send transaction from Ledger
                tx = {
                    to: '0xafa3f8684e54059998bc3a7b0d2b0da075154d66',
                    from: accounts[0],
                    value: '0xde0b6b3a7640000',
                };
                payload = {
                    jsonrpc: '2.0',
                    method: 'eth_sendTransaction',
                    params: [tx],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
                    expect(err).to.be.a('null');
                    const result = response.result;
                    const signedTxLength = 66;
                    expect(result.length).to.be.equal(signedTxLength);
                    expect(result.substr(0, 2)).to.be.equal('0x');
                    done();
                });
                ledgerProvider.sendAsync(payload, callback);
            }))().catch(done);
        });
    });
});
//# sourceMappingURL=ledger_live_subprovider_test.js.map