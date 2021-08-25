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
const src_1 = require("../src");
const chai_setup_1 = require("./utils/chai_setup");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
describe('AbiDecoder', () => {
    it('should successfully add a new ABI and decode calldata for it', () => __awaiter(void 0, void 0, void 0, function* () {
        // Add new ABI
        const abi = {
            name: 'foobar',
            type: 'function',
            inputs: [
                {
                    name: 'testAddress',
                    type: 'address',
                },
            ],
            outputs: [
                {
                    name: 'butter',
                    type: 'string',
                },
            ],
            constant: false,
            payable: false,
            stateMutability: 'pure',
        };
        const contractName = 'newContract';
        const testAddress = '0x0001020304050607080900010203040506070809';
        const abiDecoder = new src_1.AbiDecoder([]);
        abiDecoder.addABI([abi], contractName);
        // Create some tx data
        const foobarEncoder = new src_1.AbiEncoder.Method(abi);
        const foobarSignature = foobarEncoder.getSignature();
        const foobarTxData = foobarEncoder.encode([testAddress]);
        // Decode tx data using contract name
        const decodedTxData = abiDecoder.decodeCalldataOrThrow(foobarTxData, contractName);
        const expectedFunctionName = abi.name;
        const expectedFunctionArguments = { testAddress };
        expect(decodedTxData.functionName).to.be.equal(expectedFunctionName);
        expect(decodedTxData.functionSignature).to.be.equal(foobarSignature);
        expect(decodedTxData.functionArguments).to.be.deep.equal(expectedFunctionArguments);
    }));
});
//# sourceMappingURL=abi_decoder_test.js.map