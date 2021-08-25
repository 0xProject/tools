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
const chai = require("chai");
const ethUtils = require("ethereumjs-util");
const _ = require("lodash");
const src_1 = require("../../src");
const types_1 = require("../../src/types");
const chai_setup_1 = require("../chai_setup");
const fixture_data_1 = require("../utils/fixture_data");
const ganache_subprovider_1 = require("../utils/ganache_subprovider");
const report_callback_errors_1 = require("../utils/report_callback_errors");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const FAKE_ADDRESS = '0xb088a3bc93f71b4de97b9de773e9647645983688';
const DEFAULT_NUM_ACCOUNTS = 10;
describe('LedgerSubprovider', () => {
    const networkId = 42;
    let ledgerSubprovider;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        const ledgerEthereumClientFactoryAsync = () => __awaiter(void 0, void 0, void 0, function* () {
            // tslint:disable:no-object-literal-type-assertion
            const ledgerEthClient = {
                getAddress: () => __awaiter(void 0, void 0, void 0, function* () {
                    const publicKey = '04f428290f4c5ed6a198f71b8205f488141dbb3f0840c923bbfa798ecbee6370986c03b5575d94d506772fb48a6a44e345e4ebd4f028a6f609c44b655d6d3e71a1';
                    const chainCode = 'ac055a5537c0c7e9e02d14a197cad6b857836da2a12043b46912a37d959b5ae8';
                    const address = '0xBa388BA5e5EEF2c6cE42d831c2B3A28D3c99bdB1';
                    return {
                        publicKey,
                        address,
                        chainCode,
                    };
                }),
                signPersonalMessage: () => __awaiter(void 0, void 0, void 0, function* () {
                    const ecSignature = {
                        v: 27,
                        r: '1b0ec5e2908e993d0c8ab6b46da46be2688fdf03c7ea6686075de37392e50a7d',
                        s: '7fcc531446699132fbda915bd989882e0064d417018773a315fb8d43ed063c9b'
                    };
                    return ecSignature;
                }),
                signTransaction: (_derivationPath, _txHex) => __awaiter(void 0, void 0, void 0, function* () {
                    const ecSignature = {
                        v: '77',
                        r: '88a95ef1378487bc82be558e82c8478baf840c545d5b887536bb1da63673a98b',
                        s: '019f4a4b9a107d1e6752bf7f701e275f28c13791d6e76af895b07373462cefaa',
                    };
                    return ecSignature;
                }),
                transport: {
                    close: _.noop.bind(_),
                },
            };
            // tslint:enable:no-object-literal-type-assertion
            return ledgerEthClient;
        });
        ledgerSubprovider = new src_1.LedgerSubprovider({
            networkId,
            ledgerEthereumClientFactoryAsync,
        });
    }));
    describe('direct method calls', () => {
        describe('success cases', () => {
            it('returns default number of accounts', () => __awaiter(void 0, void 0, void 0, function* () {
                const accounts = yield ledgerSubprovider.getAccountsAsync();
                expect(accounts[0]).to.be.equal(FAKE_ADDRESS);
                expect(accounts.length).to.be.equal(DEFAULT_NUM_ACCOUNTS);
            }));
            it('returns requested number of accounts', () => __awaiter(void 0, void 0, void 0, function* () {
                const numberOfAccounts = 20;
                const accounts = yield ledgerSubprovider.getAccountsAsync(numberOfAccounts);
                expect(accounts[0]).to.be.equal(FAKE_ADDRESS);
                expect(accounts.length).to.be.equal(numberOfAccounts);
            }));
            it('signs a personal message', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = ethUtils.bufferToHex(Buffer.from(fixture_data_1.fixtureData.PERSONAL_MESSAGE_STRING));
                const ecSignatureHex = yield ledgerSubprovider.signPersonalMessageAsync(data, FAKE_ADDRESS);
                expect(ecSignatureHex).to.be.equal(fixture_data_1.fixtureData.PERSONAL_MESSAGE_SIGNED_RESULT);
            }));
        });
        describe('failure cases', () => {
            it('cannot open multiple simultaneous connections to the Ledger device', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = ethUtils.bufferToHex(Buffer.from('hello world'));
                return expect(Promise.all([
                    ledgerSubprovider.getAccountsAsync(),
                    ledgerSubprovider.signPersonalMessageAsync(data, FAKE_ADDRESS),
                ])).to.be.rejectedWith(types_1.LedgerSubproviderErrors.MultipleOpenConnectionsDisallowed);
            }));
        });
    });
    describe('calls through a provider', () => {
        let provider;
        before(() => {
            provider = new src_1.Web3ProviderEngine();
            provider.addProvider(ledgerSubprovider);
            provider.addProvider(ganache_subprovider_1.ganacheSubprovider);
            utils_1.providerUtils.startProviderEngine(provider);
        });
        describe('success cases', () => {
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
                    expect(response.result[0]).to.be.equal(FAKE_ADDRESS);
                    done();
                });
                provider.sendAsync(payload, callback);
            });
            it('signs a personal message with eth_sign', (done) => {
                const messageHex = ethUtils.bufferToHex(Buffer.from('hello world'));
                const payload = {
                    jsonrpc: '2.0',
                    method: 'eth_sign',
                    params: [FAKE_ADDRESS, messageHex],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
                    expect(err).to.be.a('null');
                    expect(response.result).to.be.equal(fixture_data_1.fixtureData.PERSONAL_MESSAGE_SIGNED_RESULT);
                    done();
                });
                provider.sendAsync(payload, callback);
            });
            it('signs a personal message with personal_sign', (done) => {
                const messageHex = ethUtils.bufferToHex(Buffer.from(fixture_data_1.fixtureData.PERSONAL_MESSAGE_STRING));
                const payload = {
                    jsonrpc: '2.0',
                    method: 'personal_sign',
                    params: [messageHex, FAKE_ADDRESS],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
                    expect(err).to.be.a('null');
                    expect(response.result).to.be.equal(fixture_data_1.fixtureData.PERSONAL_MESSAGE_SIGNED_RESULT);
                    done();
                });
                provider.sendAsync(payload, callback);
            });
            it('signs a transaction', (done) => {
                const tx = {
                    to: '0xafa3f8684e54059998bc3a7b0d2b0da075154d66',
                    value: '0x00',
                    gasPrice: '0x00',
                    nonce: '0x00',
                    gas: '0x00',
                    from: FAKE_ADDRESS,
                };
                const payload = {
                    jsonrpc: '2.0',
                    method: 'eth_signTransaction',
                    params: [tx],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, response) => {
                    expect(err).to.be.a('null');
                    const rawTxLength = 192;
                    expect(response.result.raw.length).to.be.equal(rawTxLength);
                    expect(response.result.raw.substr(0, 2)).to.be.equal('0x');
                    done();
                });
                provider.sendAsync(payload, callback);
            });
        });
        describe('failure cases', () => {
            it('should throw if `data` param not hex when calling eth_sign', (done) => {
                const nonHexMessage = 'hello world';
                const payload = {
                    jsonrpc: '2.0',
                    method: 'eth_sign',
                    params: [FAKE_ADDRESS, nonHexMessage],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, _response) => {
                    expect(err).to.not.be.a('null');
                    expect(err.message).to.be.equal('Expected data to be of type HexString, encountered: hello world');
                    done();
                });
                provider.sendAsync(payload, callback);
            });
            it('should throw if `data` param not hex when calling personal_sign', (done) => {
                const nonHexMessage = 'hello world';
                const payload = {
                    jsonrpc: '2.0',
                    method: 'personal_sign',
                    params: [nonHexMessage, FAKE_ADDRESS],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, _response) => {
                    expect(err).to.not.be.a('null');
                    expect(err.message).to.be.equal('Expected data to be of type HexString, encountered: hello world');
                    done();
                });
                provider.sendAsync(payload, callback);
            });
            it('should throw if `from` param missing when calling eth_sendTransaction', (done) => {
                const tx = {
                    to: '0xafa3f8684e54059998bc3a7b0d2b0da075154d66',
                    value: '0xde0b6b3a7640000',
                };
                const payload = {
                    jsonrpc: '2.0',
                    method: 'eth_sendTransaction',
                    params: [tx],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, _response) => {
                    expect(err).to.not.be.a('null');
                    expect(err.message).to.be.equal(types_1.WalletSubproviderErrors.SenderInvalidOrNotSupplied);
                    done();
                });
                provider.sendAsync(payload, callback);
            });
            it('should throw if `from` param invalid address when calling eth_sendTransaction', (done) => {
                const tx = {
                    to: '0xafa3f8684e54059998bc3a7b0d2b0da075154d66',
                    from: '0xIncorrectEthereumAddress',
                    value: '0xde0b6b3a7640000',
                };
                const payload = {
                    jsonrpc: '2.0',
                    method: 'eth_sendTransaction',
                    params: [tx],
                    id: 1,
                };
                const callback = report_callback_errors_1.reportCallbackErrors(done)((err, _response) => {
                    expect(err).to.not.be.a('null');
                    expect(err.message).to.be.equal(types_1.WalletSubproviderErrors.SenderInvalidOrNotSupplied);
                    done();
                });
                provider.sendAsync(payload, callback);
            });
        });
    });
});
//# sourceMappingURL=ledger_subprovider_test.js.map