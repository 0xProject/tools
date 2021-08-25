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
const src_1 = require("../src");
src_1.chaiSetup.configure();
const expect = chai.expect;
class DescendantRevertError extends utils_1.StringRevertError {
    constructor(msg) {
        super(msg);
    }
}
describe('Chai tests', () => {
    describe('RevertErrors', () => {
        describe('#equal', () => {
            it('should equate two identical RevertErrors', () => {
                const message = 'foo';
                const revert1 = new utils_1.StringRevertError(message);
                const revert2 = new utils_1.StringRevertError(message);
                expect(revert1).is.equal(revert2);
            });
            it('should equate two RevertErrors where one has missing fields', () => {
                const revert1 = new utils_1.StringRevertError('foo');
                const revert2 = new utils_1.StringRevertError();
                expect(revert1).is.equal(revert2);
            });
            it('should not equate two RevertErrors with diferent fields', () => {
                const revert1 = new utils_1.StringRevertError('foo1');
                const revert2 = new utils_1.StringRevertError('foo2');
                expect(revert1).is.not.equal(revert2);
            });
            it('should not equate two RevertErrors with diferent types', () => {
                const message = 'foo';
                const revert1 = new utils_1.StringRevertError(message);
                const revert2 = new DescendantRevertError(message);
                expect(revert1).is.not.equal(revert2);
            });
            it('should equate a StringRevertError to a string equal to message', () => {
                const message = 'foo';
                const revert = new utils_1.StringRevertError(message);
                expect(message).is.equal(revert);
            });
            it('should equate an Error to a StringRevertError with an equal message', () => {
                const message = 'foo';
                const revert = new utils_1.StringRevertError(message);
                const error = new Error(message);
                expect(error).is.equal(revert);
            });
            it('should equate a ganache transaction revert error with reason to a StringRevertError with an equal message', () => {
                const message = 'foo';
                const error = new Error(`VM Exception while processing transaction: revert ${message}`);
                error.hashes = ['0x1'];
                error.results = { '0x1': { error: 'revert', program_counter: 1, return: '0x', reason: message } };
                const revert = new utils_1.StringRevertError(message);
                expect(error).is.equal(revert);
            });
            it('should equate a ganache transaction revert error with return data to a StringRevertError with an equal message', () => {
                const error = new Error(`VM Exception while processing transaction: revert`);
                error.hashes = ['0x1'];
                // Encoding for `Error(string message='foo')`
                const returnData = '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003666f6f0000000000000000000000000000000000000000000000000000000000';
                error.results = {
                    '0x1': { error: 'revert', program_counter: 1, return: returnData, reason: undefined },
                };
                const revert = new utils_1.StringRevertError('foo');
                expect(error).is.equal(revert);
            });
            it('should not equate a ganache transaction revert error with reason to a StringRevertError with a different message', () => {
                const message = 'foo';
                const error = new Error(`VM Exception while processing transaction: revert ${message}`);
                error.hashes = ['0x1'];
                error.results = { '0x1': { error: 'revert', program_counter: 1, return: '0x', reason: message } };
                const revert = new utils_1.StringRevertError('boo');
                expect(error).is.not.equal(revert);
            });
            it('should not equate a ganache transaction revert error with return data to a StringRevertError with a different message', () => {
                const error = new Error(`VM Exception while processing transaction: revert`);
                error.hashes = ['0x1'];
                // Encoding for `Error(string message='foo')`
                const returnData = '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003666f6f0000000000000000000000000000000000000000000000000000000000';
                error.results = {
                    '0x1': { error: 'revert', program_counter: 1, return: returnData, reason: undefined },
                };
                const revert = new utils_1.StringRevertError('boo');
                expect(error).is.not.equal(revert);
            });
            it('should equate an opaque geth transaction revert error to any RevertError', () => {
                const error = new Error(`always failing transaction`);
                const revert = new utils_1.StringRevertError('foo');
                expect(error).is.equal(revert);
            });
            it('should equate a string to a StringRevertError with the same message', () => {
                const message = 'foo';
                const revert = new utils_1.StringRevertError(message);
                expect(revert).is.equal(message);
            });
            it('should not equate a StringRevertError to a string not equal to message', () => {
                const revert = new utils_1.StringRevertError('foo1');
                expect('foo2').is.not.equal(revert);
            });
            it('should not equate a string to a StringRevertError with a different message', () => {
                const revert = new utils_1.StringRevertError('foo1');
                expect(revert).is.not.equal('foo2');
            });
            it('should not equate an Error to a StringRevertError with a different message', () => {
                const revert = new utils_1.StringRevertError('foo1');
                const error = new Error('foo2');
                expect(error).is.not.equal(revert);
            });
        });
        describe('#revertWith', () => {
            it('should equate a promise that rejects to identical RevertErrors', () => __awaiter(void 0, void 0, void 0, function* () {
                const message = 'foo';
                const revert1 = new utils_1.StringRevertError(message);
                const revert2 = new utils_1.StringRevertError(message);
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () {
                    throw revert1;
                }))();
                return expect(promise).to.revertWith(revert2);
            }));
            it('should not equate a promise that rejects to a StringRevertError with a different messages', () => __awaiter(void 0, void 0, void 0, function* () {
                const revert1 = new utils_1.StringRevertError('foo1');
                const revert2 = new utils_1.StringRevertError('foo2');
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () {
                    throw revert1;
                }))();
                return expect(promise).to.not.revertWith(revert2);
            }));
            it('should not equate a promise that rejects to different RevertError types', () => __awaiter(void 0, void 0, void 0, function* () {
                const message = 'foo';
                const revert1 = new utils_1.StringRevertError(message);
                const revert2 = new DescendantRevertError(message);
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () {
                    throw revert1;
                }))();
                return expect(promise).to.not.revertWith(revert2);
            }));
        });
        describe('#become', () => {
            it('should equate a promise that resolves to an identical RevertErrors', () => __awaiter(void 0, void 0, void 0, function* () {
                const message = 'foo';
                const revert1 = new utils_1.StringRevertError(message);
                const revert2 = new utils_1.StringRevertError(message);
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () { return revert1; }))();
                return expect(promise).to.become(revert2);
            }));
            it('should not equate a promise that resolves to a StringRevertError with a different messages', () => __awaiter(void 0, void 0, void 0, function* () {
                const revert1 = new utils_1.StringRevertError('foo1');
                const revert2 = new utils_1.StringRevertError('foo2');
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () { return revert1; }))();
                return expect(promise).to.not.become(revert2);
            }));
            it('should not equate a promise that resolves to different RevertError types', () => __awaiter(void 0, void 0, void 0, function* () {
                const message = 'foo';
                const revert1 = new utils_1.StringRevertError(message);
                const revert2 = new DescendantRevertError(message);
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () { return revert1; }))();
                return expect(promise).to.not.become(revert2);
            }));
        });
        // TODO: Remove these tests when we no longer coerce `Error` types to `StringRevertError` types
        // for backwards compatibility.
        describe('#rejectedWith (backwards compatibility)', () => {
            it('should equate a promise that rejects with an Error to a string of the same message', () => __awaiter(void 0, void 0, void 0, function* () {
                const message = 'foo';
                const revert1 = new Error(message);
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () {
                    throw revert1;
                }))();
                return expect(promise).to.rejectedWith(message);
            }));
            it('should equate a promise that rejects with an StringRevertErrors to a string of the same message', () => __awaiter(void 0, void 0, void 0, function* () {
                const message = 'foo';
                const revert = new utils_1.StringRevertError(message);
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () {
                    throw revert;
                }))();
                return expect(promise).to.rejectedWith(message);
            }));
            it('should not equate a promise that rejects with an StringRevertErrors to a string with different messages', () => __awaiter(void 0, void 0, void 0, function* () {
                const revert = new utils_1.StringRevertError('foo1');
                const promise = (() => __awaiter(void 0, void 0, void 0, function* () {
                    throw revert;
                }))();
                return expect(promise).to.not.be.rejectedWith('foo2');
            }));
        });
    });
});
//# sourceMappingURL=chai_test.js.map