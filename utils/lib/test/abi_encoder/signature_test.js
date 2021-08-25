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
const src_1 = require("../../src");
const chai_setup_1 = require("../utils/chai_setup");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
describe('ABI Encoder: Signatures', () => {
    describe('Single type', () => {
        it('Elementary', () => __awaiter(void 0, void 0, void 0, function* () {
            const signature = 'uint256';
            const dataType = src_1.AbiEncoder.create(signature);
            const dataTypeId = dataType.getDataItem().type;
            expect(dataTypeId).to.be.equal('uint256');
            expect(dataType.getSignature()).to.be.equal(signature);
        }));
        it('Array', () => __awaiter(void 0, void 0, void 0, function* () {
            const signature = 'string[]';
            const dataType = src_1.AbiEncoder.create(signature);
            const dataItem = dataType.getDataItem();
            const expectedDataItem = {
                name: '',
                type: 'string[]',
            };
            expect(dataItem).to.be.deep.equal(expectedDataItem);
            expect(dataType.getSignature()).to.be.equal(signature);
        }));
        it('Multidimensional Array', () => __awaiter(void 0, void 0, void 0, function* () {
            // Decode return value
            const signature = 'uint256[4][][5]';
            const dataType = src_1.AbiEncoder.create(signature);
            const dataTypeId = dataType.getDataItem().type;
            expect(dataTypeId).to.be.equal(signature);
            expect(dataType.getSignature()).to.be.equal(signature);
        }));
        it('Tuple with single element', () => __awaiter(void 0, void 0, void 0, function* () {
            const signature = '(uint256)';
            const dataType = src_1.AbiEncoder.create(signature);
            const dataItem = dataType.getDataItem();
            const expectedDataItem = {
                name: '',
                type: 'tuple',
                components: [
                    {
                        name: '',
                        type: 'uint256',
                    },
                ],
            };
            expect(dataItem).to.be.deep.equal(expectedDataItem);
            expect(dataType.getSignature()).to.be.equal(signature);
        }));
        it('Tuple with multiple elements', () => __awaiter(void 0, void 0, void 0, function* () {
            const signature = '(uint256,string,bytes4)';
            const dataType = src_1.AbiEncoder.create(signature);
            const dataItem = dataType.getDataItem();
            const expectedDataItem = {
                name: '',
                type: 'tuple',
                components: [
                    {
                        name: '',
                        type: 'uint256',
                    },
                    {
                        name: '',
                        type: 'string',
                    },
                    {
                        name: '',
                        type: 'bytes4',
                    },
                ],
            };
            expect(dataItem).to.be.deep.equal(expectedDataItem);
            expect(dataType.getSignature()).to.be.equal(signature);
        }));
        it('Tuple with nested array and nested tuple', () => __awaiter(void 0, void 0, void 0, function* () {
            const signature = '(uint256[],(bytes),string[4],bytes4)';
            const dataType = src_1.AbiEncoder.create(signature);
            const dataItem = dataType.getDataItem();
            const expectedDataItem = {
                name: '',
                type: 'tuple',
                components: [
                    {
                        name: '',
                        type: 'uint256[]',
                    },
                    {
                        name: '',
                        type: 'tuple',
                        components: [
                            {
                                name: '',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: '',
                        type: 'string[4]',
                    },
                    {
                        name: '',
                        type: 'bytes4',
                    },
                ],
            };
            expect(dataItem).to.be.deep.equal(expectedDataItem);
            expect(dataType.getSignature()).to.be.equal(signature);
        }));
        it('Array of complex tuples', () => __awaiter(void 0, void 0, void 0, function* () {
            const signature = '(uint256[],(bytes),string[4],bytes4)[5][4][]';
            const dataType = src_1.AbiEncoder.create(signature);
            const dataItem = dataType.getDataItem();
            const expectedDataItem = {
                name: '',
                type: 'tuple[5][4][]',
                components: [
                    {
                        name: '',
                        type: 'uint256[]',
                    },
                    {
                        name: '',
                        type: 'tuple',
                        components: [
                            {
                                name: '',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: '',
                        type: 'string[4]',
                    },
                    {
                        name: '',
                        type: 'bytes4',
                    },
                ],
            };
            expect(dataItem).to.be.deep.equal(expectedDataItem);
            expect(dataType.getSignature()).to.be.equal(signature);
        }));
    });
    describe('Function', () => {
        it('No inputs and no outputs', () => __awaiter(void 0, void 0, void 0, function* () {
            // create encoder
            const functionName = 'foo';
            const dataType = src_1.AbiEncoder.createMethod(functionName);
            // create expected values
            const expectedSignature = 'foo()';
            const expectedInputDataItem = {
                name: 'foo',
                type: 'method',
                components: [],
            };
            const expectedOutputDataItem = {
                name: 'foo',
                type: 'tuple',
                components: [],
            };
            // check expected values
            expect(dataType.getSignature()).to.be.equal(expectedSignature);
            expect(dataType.getDataItem()).to.be.deep.equal(expectedInputDataItem);
            expect(dataType.getReturnValueDataItem()).to.be.deep.equal(expectedOutputDataItem);
        }));
        it('No inputs and no outputs (empty arrays as input)', () => __awaiter(void 0, void 0, void 0, function* () {
            // create encoder
            const functionName = 'foo';
            const dataType = src_1.AbiEncoder.createMethod(functionName, [], []);
            // create expected values
            const expectedSignature = 'foo()';
            const expectedInputDataItem = {
                name: 'foo',
                type: 'method',
                components: [],
            };
            const expectedOutputDataItem = {
                name: 'foo',
                type: 'tuple',
                components: [],
            };
            // check expected values
            expect(dataType.getSignature()).to.be.equal(expectedSignature);
            expect(dataType.getDataItem()).to.be.deep.equal(expectedInputDataItem);
            expect(dataType.getReturnValueDataItem()).to.be.deep.equal(expectedOutputDataItem);
        }));
        it('Single DataItem input and single DataItem output', () => __awaiter(void 0, void 0, void 0, function* () {
            // create encoder
            const functionName = 'foo';
            const inputDataItem = {
                name: 'input',
                type: 'uint256',
            };
            const outputDataItem = {
                name: 'output',
                type: 'string',
            };
            const dataType = src_1.AbiEncoder.createMethod(functionName, inputDataItem, outputDataItem);
            // create expected values
            const expectedSignature = 'foo(uint256)';
            const expectedInputDataItem = {
                name: 'foo',
                type: 'method',
                components: [inputDataItem],
            };
            const expectedOutputDataItem = {
                name: 'foo',
                type: 'tuple',
                components: [outputDataItem],
            };
            // check expected values
            expect(dataType.getSignature()).to.be.equal(expectedSignature);
            expect(dataType.getDataItem()).to.be.deep.equal(expectedInputDataItem);
            expect(dataType.getReturnValueDataItem()).to.be.deep.equal(expectedOutputDataItem);
        }));
        it('Single signature input and single signature output', () => __awaiter(void 0, void 0, void 0, function* () {
            // create encoder
            const functionName = 'foo';
            const inputSignature = 'uint256';
            const outputSignature = 'string';
            const dataType = src_1.AbiEncoder.createMethod(functionName, inputSignature, outputSignature);
            // create expected values
            const expectedSignature = 'foo(uint256)';
            const expectedInputDataItem = {
                name: 'foo',
                type: 'method',
                components: [
                    {
                        name: '',
                        type: 'uint256',
                    },
                ],
            };
            const expectedOutputDataItem = {
                name: 'foo',
                type: 'tuple',
                components: [
                    {
                        name: '',
                        type: 'string',
                    },
                ],
            };
            // check expected values
            expect(dataType.getSignature()).to.be.equal(expectedSignature);
            expect(dataType.getDataItem()).to.be.deep.equal(expectedInputDataItem);
            expect(dataType.getReturnValueDataItem()).to.be.deep.equal(expectedOutputDataItem);
        }));
        it('Single signature tuple input and single signature tuple output', () => __awaiter(void 0, void 0, void 0, function* () {
            // create encoder
            const functionName = 'foo';
            const inputSignature = '(uint256,bytes[][4])';
            const outputSignature = '(string,uint32)';
            const dataType = src_1.AbiEncoder.createMethod(functionName, inputSignature, outputSignature);
            // create expected values
            const expectedSignature = 'foo((uint256,bytes[][4]))';
            const expectedInputDataItem = {
                name: 'foo',
                type: 'method',
                components: [
                    {
                        name: '',
                        type: 'tuple',
                        components: [
                            {
                                name: '',
                                type: 'uint256',
                            },
                            {
                                name: '',
                                type: 'bytes[][4]',
                            },
                        ],
                    },
                ],
            };
            const expectedOutputDataItem = {
                name: 'foo',
                type: 'tuple',
                components: [
                    {
                        name: '',
                        type: 'tuple',
                        components: [
                            {
                                name: '',
                                type: 'string',
                            },
                            {
                                name: '',
                                type: 'uint32',
                            },
                        ],
                    },
                ],
            };
            // check expected values
            expect(dataType.getSignature()).to.be.equal(expectedSignature);
            expect(dataType.getDataItem()).to.be.deep.equal(expectedInputDataItem);
            expect(dataType.getReturnValueDataItem()).to.be.deep.equal(expectedOutputDataItem);
        }));
        it('Mutiple DataItem input and multiple DataItem output', () => __awaiter(void 0, void 0, void 0, function* () {
            // create encoder
            const functionName = 'foo';
            const inputDataItems = [
                {
                    name: '',
                    type: 'uint256',
                },
                {
                    name: '',
                    type: 'bytes[][4]',
                },
            ];
            const outputDataItems = [
                {
                    name: '',
                    type: 'string',
                },
                {
                    name: '',
                    type: 'uint32',
                },
            ];
            const dataType = src_1.AbiEncoder.createMethod(functionName, inputDataItems, outputDataItems);
            // create expected values
            const expectedSignature = 'foo(uint256,bytes[][4])';
            const expectedInputDataItem = {
                name: 'foo',
                type: 'method',
                components: inputDataItems,
            };
            const expectedOutputDataItem = {
                name: 'foo',
                type: 'tuple',
                components: outputDataItems,
            };
            // check expected values
            expect(dataType.getSignature()).to.be.equal(expectedSignature);
            expect(dataType.getDataItem()).to.be.deep.equal(expectedInputDataItem);
            expect(dataType.getReturnValueDataItem()).to.be.deep.equal(expectedOutputDataItem);
        }));
        it('Multiple signature input and multiple signature output', () => __awaiter(void 0, void 0, void 0, function* () {
            // create encoder
            const functionName = 'foo';
            const inputSignatures = ['uint256', 'bytes[][4]'];
            const outputSignatures = ['string', 'uint32'];
            const dataType = src_1.AbiEncoder.createMethod(functionName, inputSignatures, outputSignatures);
            // create expected values
            const expectedSignature = 'foo(uint256,bytes[][4])';
            const expectedInputDataItem = {
                name: 'foo',
                type: 'method',
                components: [
                    {
                        name: '',
                        type: 'uint256',
                    },
                    {
                        name: '',
                        type: 'bytes[][4]',
                    },
                ],
            };
            const expectedOutputDataItem = {
                name: 'foo',
                type: 'tuple',
                components: [
                    {
                        name: '',
                        type: 'string',
                    },
                    {
                        name: '',
                        type: 'uint32',
                    },
                ],
            };
            // check expected values
            expect(dataType.getSignature()).to.be.equal(expectedSignature);
            expect(dataType.getDataItem()).to.be.deep.equal(expectedInputDataItem);
            expect(dataType.getReturnValueDataItem()).to.be.deep.equal(expectedOutputDataItem);
        }));
    });
});
//# sourceMappingURL=signature_test.js.map