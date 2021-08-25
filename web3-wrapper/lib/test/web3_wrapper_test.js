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
const ethereum_types_1 = require("ethereum-types");
const Ganache = require("ganache-core");
const _ = require("lodash");
require("mocha");
const web3_wrapper_1 = require("../src/web3_wrapper");
const chai_setup_1 = require("./utils/chai_setup");
chai_setup_1.chaiSetup.configure();
const { expect } = chai;
const NUM_GANACHE_ADDRESSES = 10;
describe('Web3Wrapper tests', () => {
    const NETWORK_ID = 50;
    const provider = Ganache.provider({ network_id: NETWORK_ID });
    const web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider);
    let addresses;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        addresses = yield web3Wrapper.getAvailableAddressesAsync();
    }));
    describe('#isAddress', () => {
        it('correctly checks if a string is a valid ethereum address', () => {
            expect(web3_wrapper_1.Web3Wrapper.isAddress('0x0')).to.be.false;
            expect(web3_wrapper_1.Web3Wrapper.isAddress('0xdeadbeef')).to.be.false;
            expect(web3_wrapper_1.Web3Wrapper.isAddress('42')).to.be.false;
            expect(web3_wrapper_1.Web3Wrapper.isAddress('weth.thetoken.eth')).to.be.false;
            expect(web3_wrapper_1.Web3Wrapper.isAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')).to.be.true;
            expect(web3_wrapper_1.Web3Wrapper.isAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')).to.be.true;
        });
    });
    describe('#getNodeVersionAsync', () => {
        it('gets the node version', () => __awaiter(void 0, void 0, void 0, function* () {
            const nodeVersion = yield web3Wrapper.getNodeVersionAsync();
            expect(nodeVersion).to.be.match(/EthereumJS TestRPC\/.+\/ethereum-js$/);
        }));
    });
    describe('#getNetworkIdAsync', () => {
        it('gets the network id', () => __awaiter(void 0, void 0, void 0, function* () {
            const networkId = yield web3Wrapper.getNetworkIdAsync();
            expect(networkId).to.be.equal(NETWORK_ID);
        }));
    });
    describe('#getNetworkIdAsync', () => {
        it('gets the network id', () => __awaiter(void 0, void 0, void 0, function* () {
            const networkId = yield web3Wrapper.getNetworkIdAsync();
            expect(networkId).to.be.equal(NETWORK_ID);
        }));
    });
    describe('#getAvailableAddressesAsync', () => {
        it('gets the available addresses', () => __awaiter(void 0, void 0, void 0, function* () {
            const availableAddresses = yield web3Wrapper.getAvailableAddressesAsync();
            expect(availableAddresses.length).to.be.equal(NUM_GANACHE_ADDRESSES);
            expect(web3_wrapper_1.Web3Wrapper.isAddress(availableAddresses[0])).to.equal(true);
        }));
    });
    describe('#getBalanceInWeiAsync', () => {
        it('gets the users balance in wei', () => __awaiter(void 0, void 0, void 0, function* () {
            const secondAccount = addresses[1];
            const balanceInWei = yield web3Wrapper.getBalanceInWeiAsync(secondAccount);
            const tenEthInWei = 100000000000000000000;
            expect(balanceInWei).to.be.bignumber.equal(tenEthInWei);
        }));
        it('should throw if supplied owner not an Ethereum address hex string', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidEthAddress = 'deadbeef';
            expect(web3Wrapper.getBalanceInWeiAsync(invalidEthAddress)).to.eventually.to.be.rejected();
        }));
    });
    describe('#signMessageAsync', () => {
        it('should sign message', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = '0xdeadbeef';
            const signer = addresses[1];
            const signature = yield web3Wrapper.signMessageAsync(signer, message);
            const signatureLength = 132;
            expect(signature.length).to.be.equal(signatureLength);
        }));
        it('should throw if the provider returns an error', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = '0xdeadbeef';
            const signer = addresses[1];
            const fakeProvider = {
                sendAsync(payload, callback) {
                    return __awaiter(this, void 0, void 0, function* () {
                        callback(new Error('User denied message signature'));
                    });
                },
            };
            const errorWeb3Wrapper = new web3_wrapper_1.Web3Wrapper(fakeProvider);
            expect(errorWeb3Wrapper.signMessageAsync(signer, message)).to.be.rejectedWith('User denied message signature');
        }));
    });
    describe('#getBlockNumberAsync', () => {
        it('get block number', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockNumber = yield web3Wrapper.getBlockNumberAsync();
            expect(typeof blockNumber).to.be.equal('number');
        }));
    });
    describe('#getTransactionReceiptAsync/awaitTransactionSuccessAsync', () => {
        it('get block number', () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = { from: addresses[0], to: addresses[1], value: 1 };
            const txHash = yield web3Wrapper.sendTransactionAsync(payload);
            yield web3Wrapper.awaitTransactionSuccessAsync(txHash);
            const receiptIfExists = yield web3Wrapper.getTransactionReceiptIfExistsAsync(txHash);
            expect(receiptIfExists).to.not.be.undefined;
            const receipt = receiptIfExists;
            expect(receipt.transactionIndex).to.be.a('number');
            expect(receipt.transactionHash).to.be.equal(txHash);
        }));
    });
    describe('#getBlockIfExistsAsync', () => {
        it('gets block when supplied a valid BlockParamLiteral value', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockParamLiteral = ethereum_types_1.BlockParamLiteral.Earliest;
            const blockIfExists = yield web3Wrapper.getBlockIfExistsAsync(blockParamLiteral);
            if (blockIfExists === undefined) {
                throw new Error('Expected block to exist');
            }
            expect(blockIfExists.number).to.be.equal(0);
            expect(utils_1.BigNumber.isBigNumber(blockIfExists.difficulty)).to.equal(true);
            expect(_.isNumber(blockIfExists.gasLimit)).to.equal(true);
        }));
        it('gets block when supplied a block number', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockParamLiteral = 0;
            const blockIfExists = yield web3Wrapper.getBlockIfExistsAsync(blockParamLiteral);
            if (blockIfExists === undefined) {
                throw new Error('Expected block to exist');
            }
            expect(blockIfExists.number).to.be.equal(0);
        }));
        it('gets block when supplied a block hash', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockParamLiteral = 0;
            const blockIfExists = yield web3Wrapper.getBlockIfExistsAsync(blockParamLiteral);
            if (blockIfExists === undefined) {
                throw new Error('Expected block to exist');
            }
            const sameBlockIfExists = yield web3Wrapper.getBlockIfExistsAsync(blockIfExists.hash);
            if (sameBlockIfExists === undefined) {
                throw new Error('Expected block to exist');
            }
            expect(sameBlockIfExists.number).to.be.equal(0);
        }));
        it('should throw if supplied invalid blockParam value', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidBlockParam = 'deadbeef';
            expect(web3Wrapper.getBlockIfExistsAsync(invalidBlockParam)).to.eventually.to.be.rejected();
        }));
    });
    describe('#getBlockWithTransactionDataAsync', () => {
        it('gets block when supplied a valid BlockParamLiteral value', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockParamLiteral = ethereum_types_1.BlockParamLiteral.Earliest;
            const block = yield web3Wrapper.getBlockWithTransactionDataAsync(blockParamLiteral);
            expect(block.number).to.be.equal(0);
            expect(utils_1.BigNumber.isBigNumber(block.difficulty)).to.equal(true);
            expect(_.isNumber(block.gasLimit)).to.equal(true);
        }));
        it('should throw if supplied invalid blockParam value', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidBlockParam = 'deadbeef';
            expect(web3Wrapper.getBlockWithTransactionDataAsync(invalidBlockParam)).to.eventually.to.be.rejected();
        }));
    });
    describe('#getBlockTimestampAsync', () => {
        it('gets block timestamp', () => __awaiter(void 0, void 0, void 0, function* () {
            const blockParamLiteral = ethereum_types_1.BlockParamLiteral.Earliest;
            const timestamp = yield web3Wrapper.getBlockTimestampAsync(blockParamLiteral);
            expect(_.isNumber(timestamp)).to.be.equal(true);
        }));
    });
});
//# sourceMappingURL=web3_wrapper_test.js.map