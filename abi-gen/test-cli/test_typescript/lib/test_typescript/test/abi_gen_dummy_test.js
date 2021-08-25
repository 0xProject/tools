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
const dev_utils_1 = require("@0x/dev-utils");
const utils_1 = require("@0x/utils");
const web3_wrapper_1 = require("@0x/web3-wrapper");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const ChaiBigNumber = require("chai-bignumber");
const dirtyChai = require("dirty-chai");
const Sinon = require("sinon");
const src_1 = require("../src");
const txDefaults = {
    from: dev_utils_1.devConstants.TESTRPC_FIRST_ADDRESS,
    gas: dev_utils_1.devConstants.GAS_LIMIT,
};
const provider = dev_utils_1.web3Factory.getRpcProvider({ shouldUseInProcessGanache: true });
const web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider);
chai.config.includeStack = true;
chai.use(ChaiBigNumber());
chai.use(dirtyChai);
chai.use(chaiAsPromised);
const expect = chai.expect;
const blockchainLifecycle = new dev_utils_1.BlockchainLifecycle(web3Wrapper);
describe('AbiGenDummy Contract', () => {
    let abiGenDummy;
    const runTestAsync = (contractMethodName, contractMethod, input, output) => __awaiter(void 0, void 0, void 0, function* () {
        const transaction = contractMethod.getABIEncodedTransactionData();
        // try decoding transaction
        const decodedInput = abiGenDummy.getABIDecodedTransactionData(contractMethodName, transaction);
        expect(decodedInput, 'decoded input').to.be.deep.equal(input);
        // execute transaction
        const rawOutput = yield web3Wrapper.callAsync({
            to: abiGenDummy.address,
            data: transaction,
        });
        // try decoding output
        const decodedOutput = abiGenDummy.getABIDecodedReturnData(contractMethodName, rawOutput);
        expect(decodedOutput, 'decoded output').to.be.deep.equal(output);
    });
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        utils_1.providerUtils.startProviderEngine(provider);
        abiGenDummy = yield src_1.AbiGenDummyContract.deployFrom0xArtifactAsync(src_1.artifacts.AbiGenDummy, provider, txDefaults, src_1.artifacts);
        yield blockchainLifecycle.startAsync();
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield blockchainLifecycle.revertAsync();
    }));
    describe('simplePureFunction', () => {
        it('should call simplePureFunction', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield abiGenDummy.simplePureFunction().callAsync();
            expect(result).to.deep.equal(new utils_1.BigNumber(1));
        }));
    });
    describe('simplePureFunctionWithInput', () => {
        it('should call simplePureFunctionWithInput', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield abiGenDummy.simplePureFunctionWithInput(new utils_1.BigNumber(5)).callAsync();
            expect(result).to.deep.equal(new utils_1.BigNumber(6));
        }));
    });
    describe('pureFunctionWithConstant', () => {
        it('should call pureFunctionWithConstant', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield abiGenDummy.pureFunctionWithConstant().callAsync();
            expect(result).to.deep.equal(new utils_1.BigNumber(1234));
        }));
    });
    describe('simpleRevert', () => {
        it('should call simpleRevert', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(abiGenDummy.simpleRevert().callAsync())
                .to.eventually.be.rejectedWith(utils_1.StringRevertError)
                .and.deep.equal(new utils_1.StringRevertError('SIMPLE_REVERT'));
        }));
    });
    describe('revertWithConstant', () => {
        it('should call revertWithConstant', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(abiGenDummy.revertWithConstant().callAsync())
                .to.eventually.be.rejectedWith(utils_1.StringRevertError)
                .and.deep.equal(new utils_1.StringRevertError('REVERT_WITH_CONSTANT'));
        }));
    });
    describe('simpleRequire', () => {
        it('should call simpleRequire', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(abiGenDummy.simpleRequire().callAsync())
                .to.eventually.be.rejectedWith(utils_1.StringRevertError)
                .and.deep.equal(new utils_1.StringRevertError('SIMPLE_REQUIRE'));
        }));
    });
    describe('requireWithConstant', () => {
        it('should call requireWithConstant', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(abiGenDummy.requireWithConstant().callAsync())
                .to.eventually.be.rejectedWith(utils_1.StringRevertError)
                .and.deep.equal(new utils_1.StringRevertError('REQUIRE_WITH_CONSTANT'));
        }));
    });
    describe('struct handling', () => {
        const sampleStruct = {
            aDynamicArrayOfBytes: ['0x3078313233', '0x3078333231'],
            anInteger: new utils_1.BigNumber(5),
            aString: 'abc',
            someBytes: '0x3078313233',
        };
        it('should be able to handle struct output', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield abiGenDummy.structOutput().callAsync();
            expect(result).to.deep.equal(sampleStruct);
        }));
    });
    describe('ecrecoverFn', () => {
        it('should implement ecrecover', () => __awaiter(void 0, void 0, void 0, function* () {
            const signerAddress = dev_utils_1.devConstants.TESTRPC_FIRST_ADDRESS;
            const message = '0x6927e990021d23b1eb7b8789f6a6feaf98fe104bb0cf8259421b79f9a34222b0';
            const signature = yield web3Wrapper.signMessageAsync(signerAddress, message);
            // tslint:disable:custom-no-magic-numbers
            const r = `0x${signature.slice(2, 66)}`;
            const s = `0x${signature.slice(66, 130)}`;
            const v = signature.slice(130, 132);
            const v_decimal = parseInt(v, 16) + 27; // v: (0 or 1) => (27 or 28)
            // tslint:enable:custom-no-magic-numbers
            const result = yield abiGenDummy.ecrecoverFn(message, v_decimal, r, s).callAsync();
            expect(result).to.equal(signerAddress);
        }));
    });
    describe('event subscription', () => {
        const indexFilterValues = {};
        const emptyCallback = () => { }; // tslint:disable-line:no-empty
        let stubs = [];
        afterEach(() => {
            stubs.forEach(s => s.restore());
            stubs = [];
        });
        it('should return a subscription token', done => {
            const subscriptionToken = abiGenDummy.subscribe(src_1.AbiGenDummyEvents.Withdrawal, indexFilterValues, emptyCallback);
            expect(subscriptionToken).to.be.a('string');
            done();
        });
        it('should allow unsubscribeAll to be called successfully after an error', done => {
            abiGenDummy.subscribe(src_1.AbiGenDummyEvents.Withdrawal, indexFilterValues, emptyCallback);
            stubs.push(Sinon.stub(abiGenDummy._web3Wrapper, 'getBlockIfExistsAsync').throws(new Error('JSON RPC error')));
            abiGenDummy.unsubscribeAll();
            done();
        });
    });
    describe('getLogsAsync', () => {
        const blockRange = {
            fromBlock: 0,
            toBlock: web3_wrapper_1.BlockParamLiteral.Latest,
        };
        it('should get logs with decoded args emitted by EventWithStruct', () => __awaiter(void 0, void 0, void 0, function* () {
            yield abiGenDummy.emitSimpleEvent().awaitTransactionSuccessAsync();
            const eventName = src_1.AbiGenDummyEvents.SimpleEvent;
            const indexFilterValues = {};
            const logs = yield abiGenDummy.getLogsAsync(eventName, blockRange, indexFilterValues);
            expect(logs).to.have.length(1);
            expect(logs[0].event).to.be.equal(eventName);
        }));
        it('should only get the logs with the correct event name', () => __awaiter(void 0, void 0, void 0, function* () {
            yield abiGenDummy.emitSimpleEvent().awaitTransactionSuccessAsync();
            const differentEventName = src_1.AbiGenDummyEvents.Withdrawal;
            const indexFilterValues = {};
            const logs = yield abiGenDummy.getLogsAsync(differentEventName, blockRange, indexFilterValues);
            expect(logs).to.have.length(0);
        }));
        it('should only get the logs with the correct indexed fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const [addressOne, addressTwo] = yield web3Wrapper.getAvailableAddressesAsync();
            yield abiGenDummy.withdraw(new utils_1.BigNumber(1)).awaitTransactionSuccessAsync({ from: addressOne });
            yield abiGenDummy.withdraw(new utils_1.BigNumber(1)).awaitTransactionSuccessAsync({ from: addressTwo });
            const eventName = src_1.AbiGenDummyEvents.Withdrawal;
            const indexFilterValues = {
                _owner: addressOne,
            };
            const logs = yield abiGenDummy.getLogsAsync(eventName, blockRange, indexFilterValues);
            expect(logs).to.have.length(1);
            const args = logs[0].args;
            expect(args._owner).to.be.equal(addressOne);
        }));
    });
    describe('withAddressInput', () => {
        it('should normalize address inputs to lowercase', () => __awaiter(void 0, void 0, void 0, function* () {
            const xAddress = dev_utils_1.devConstants.TESTRPC_FIRST_ADDRESS.toUpperCase();
            const yAddress = dev_utils_1.devConstants.TESTRPC_FIRST_ADDRESS;
            const a = new utils_1.BigNumber(1);
            const b = new utils_1.BigNumber(2);
            const c = new utils_1.BigNumber(3);
            const output = yield abiGenDummy.withAddressInput(xAddress, a, b, yAddress, c).callAsync();
            expect(output).to.equal(xAddress.toLowerCase());
        }));
    });
    describe('Encoding/Decoding Transaction Data and Return Values', () => {
        it('should successfully encode/decode (no input / no output)', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = undefined;
            const output = undefined;
            yield runTestAsync('noInputNoOutput', abiGenDummy.noInputNoOutput(), input, output);
        }));
        it('should successfully encode/decode (no input / simple output)', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = undefined;
            const output = new utils_1.BigNumber(1991);
            yield runTestAsync('noInputSimpleOutput', abiGenDummy.noInputSimpleOutput(), input, output);
        }));
        it('should successfully encode/decode (simple input / no output)', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = new utils_1.BigNumber(1991);
            const output = undefined;
            yield runTestAsync('simpleInputNoOutput', abiGenDummy.simpleInputNoOutput(input), input, output);
        }));
        it('should successfully encode/decode (simple input / simple output)', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = new utils_1.BigNumber(16);
            const output = new utils_1.BigNumber(1991);
            yield runTestAsync('simpleInputSimpleOutput', abiGenDummy.simpleInputSimpleOutput(input), input, output);
        }));
        it('should successfully encode/decode (complex input / complex output)', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = {
                foo: new utils_1.BigNumber(1991),
                bar: '0x1234',
                car: 'zoom zoom',
            };
            const output = {
                input,
                lorem: '0x12345678',
                ipsum: '0x87654321',
                dolor: 'amet',
            };
            yield runTestAsync('complexInputComplexOutput', abiGenDummy.complexInputComplexOutput(input), input, output);
        }));
        it('should successfully encode/decode (multi-input / multi-output)', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = [new utils_1.BigNumber(1991), '0x1234', 'zoom zoom'];
            const output = ['0x12345678', '0x87654321', 'amet'];
            const transaction = abiGenDummy
                .multiInputMultiOutput(input[0], input[1], input[2])
                .getABIEncodedTransactionData();
            // try decoding transaction
            const decodedInput = abiGenDummy.getABIDecodedTransactionData('multiInputMultiOutput', transaction);
            expect(decodedInput, 'decoded input').to.be.deep.equal(input);
            // execute transaction
            const rawOutput = yield web3Wrapper.callAsync({
                to: abiGenDummy.address,
                data: transaction,
            });
            // try decoding output
            const decodedOutput = abiGenDummy.getABIDecodedReturnData('multiInputMultiOutput', rawOutput);
            expect(decodedOutput, 'decoded output').to.be.deep.equal(output);
        }));
    });
    describe('awaitTransactionSuccessAsync', () => __awaiter(void 0, void 0, void 0, function* () {
        it('should successfully call the non pure function', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(abiGenDummy.nonPureMethod().awaitTransactionSuccessAsync({}, { pollingIntervalMs: 10, timeoutMs: 100 })).to.be.fulfilled('');
        }));
    }));
});
describe('Lib dummy contract', () => {
    let libDummy;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        yield blockchainLifecycle.startAsync();
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield blockchainLifecycle.revertAsync();
    }));
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        libDummy = yield src_1.TestLibDummyContract.deployFrom0xArtifactAsync(src_1.artifacts.TestLibDummy, provider, txDefaults, src_1.artifacts);
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield blockchainLifecycle.startAsync();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield blockchainLifecycle.revertAsync();
    }));
    it('should call a library function', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield libDummy.publicAddOne(new utils_1.BigNumber(1)).callAsync();
        expect(result).to.deep.equal(new utils_1.BigNumber(2));
    }));
    it('should call a library function referencing a constant', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield libDummy.publicAddConstant(new utils_1.BigNumber(1)).callAsync();
        expect(result).to.deep.equal(new utils_1.BigNumber(1235));
    }));
});
//# sourceMappingURL=abi_gen_dummy_test.js.map