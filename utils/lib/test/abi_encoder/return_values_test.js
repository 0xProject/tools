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
require("mocha");
const src_1 = require("../../src/");
const chai_setup_1 = require("../utils/chai_setup");
const ReturnValueAbis = require("./abi_samples/return_value_abis");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
describe('ABI Encoder: Return Value Encoding/Decoding', () => {
    const DECODE_BEYOND_CALL_DATA_ERROR = 'Tried to decode beyond the end of calldata';
    const encodingRules = { shouldOptimize: false }; // optimizer is tested separately.
    const nullEncodedReturnValue = '0x';
    describe('Standard encoding/decoding', () => {
        it('No Return Value', () => __awaiter(void 0, void 0, void 0, function* () {
            // Decode return value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.noReturnValues);
            const returnValue = '0x';
            const decodedReturnValue = method.decodeReturnValues(returnValue, { shouldConvertStructsToObjects: false });
            const expectedDecodedReturnValue = [];
            expect(decodedReturnValue).to.be.deep.equal(expectedDecodedReturnValue);
        }));
        it('Single static return value', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleStaticReturnValue);
            const returnValue = ['0x01020304'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.decodeReturnValues(encodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Multiple static return values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.multipleStaticReturnValues);
            const returnValue = ['0x01020304', '0x05060708'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.decodeReturnValues(encodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Single dynamic return value', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleDynamicReturnValue);
            const returnValue = ['0x01020304'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.decodeReturnValues(encodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Multiple dynamic return values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.multipleDynamicReturnValues);
            const returnValue = ['0x01020304', '0x05060708'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.decodeReturnValues(encodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Mixed static/dynamic return values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.mixedStaticAndDynamicReturnValues);
            const returnValue = ['0x01020304', '0x05060708'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.decodeReturnValues(encodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Should decode NULL as default value (single; static)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleStaticReturnValue);
            const returnValue = ['0x00000000'];
            const decodedReturnValue = method.decodeReturnValues(nullEncodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Should decode NULL as default value (multiple; static)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.multipleStaticReturnValues);
            const returnValue = ['0x00000000', '0x00000000'];
            const decodedReturnValue = method.decodeReturnValues(nullEncodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Should decode NULL as default value (single; dynamic)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleDynamicReturnValue);
            const returnValue = ['0x'];
            const decodedReturnValue = method.decodeReturnValues(nullEncodedReturnValue, {
                shouldConvertStructsToObjects: false,
            });
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
    });
    describe('Strict encoding/decoding', () => {
        it('No Return Value', () => __awaiter(void 0, void 0, void 0, function* () {
            // Decode return value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.noReturnValues);
            const returnValue = '0x';
            const decodedReturnValue = method.strictDecodeReturnValue(returnValue);
            const expectedDecodedReturnValue = undefined;
            expect(decodedReturnValue).to.be.deep.equal(expectedDecodedReturnValue);
        }));
        it('Single static return value', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleStaticReturnValue);
            const returnValue = ['0x01020304'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue[0]);
        }));
        it('Multiple static return values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.multipleStaticReturnValues);
            const returnValue = ['0x01020304', '0x05060708'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Single dynamic return value', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleDynamicReturnValue);
            const returnValue = ['0x01020304'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue[0]);
        }));
        it('Multiple dynamic return values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.multipleDynamicReturnValues);
            const returnValue = ['0x01020304', '0x05060708'];
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            expect(decodedReturnValue).to.be.deep.equal(returnValue);
        }));
        it('Struct should include fields', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.structuredReturnValue);
            const returnValue = {
                fillResults: {
                    makerAssetFilledAmount: new src_1.BigNumber(50),
                    takerAssetFilledAmount: new src_1.BigNumber(40),
                },
            };
            const encodedReturnValue = method.encodeReturnValues(returnValue, encodingRules);
            const decodedReturnValue = method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            // Note that only the contents of `fillResults`, not the key itself, is decoded.
            // This is by design, as only a struct's contents are encoded and returned by a funciton call.
            expect(decodedReturnValue).to.be.deep.equal(returnValue.fillResults);
        }));
        it('Should fail to decode NULL (single; static)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleStaticReturnValue);
            const encodedReturnValue = '0x';
            const decodeReturnValue = () => method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            expect(decodeReturnValue).to.throws(DECODE_BEYOND_CALL_DATA_ERROR);
        }));
        it('Should fail to decode NULL (multiple; static)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.multipleStaticReturnValues);
            const encodedReturnValue = '0x';
            const decodeReturnValue = () => method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            expect(decodeReturnValue).to.throws(DECODE_BEYOND_CALL_DATA_ERROR);
        }));
        it('Should fail to decode NULL (single; dynamic)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate Return Value
            const method = new src_1.AbiEncoder.Method(ReturnValueAbis.singleDynamicReturnValue);
            const encodedReturnValue = '0x';
            const decodeReturnValue = () => method.strictDecodeReturnValue(encodedReturnValue);
            // Validate decoded return value
            expect(decodeReturnValue).to.throws(DECODE_BEYOND_CALL_DATA_ERROR);
        }));
    });
});
//# sourceMappingURL=return_values_test.js.map