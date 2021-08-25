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
const chai_1 = require("chai");
const _ = require("lodash");
const path = require("path");
const extract_docs_1 = require("../src/extract_docs");
dev_utils_1.chaiSetup.configure();
// tslint:disable: custom-no-magic-numbers
describe('extractDocsAsync()', () => {
    const INTERFACE_CONTRACT = 'InterfaceContract';
    const TEST_CONTRACT = 'TestContract';
    const BASE_CONTRACT = 'BaseContract';
    const LIBRARY_CONTRACT = 'LibraryContract';
    const INPUT_CONTRACTS = [TEST_CONTRACT, BASE_CONTRACT, LIBRARY_CONTRACT, INTERFACE_CONTRACT];
    const INPUT_FILE_PATHS = INPUT_CONTRACTS.map(f => path.resolve(__dirname, '../../test/inputs', `${f}.sol`));
    let docs;
    function createDocString(itemName) {
        return `Documentation for \`${itemName}\`.`;
    }
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        docs = yield extract_docs_1.extractDocsAsync(_.shuffle(INPUT_FILE_PATHS));
    }));
    describe('contracts', () => {
        it('extracts all contracts with docs', () => __awaiter(void 0, void 0, void 0, function* () {
            const contractLines = {
                [TEST_CONTRACT]: 10,
                [BASE_CONTRACT]: 9,
                [INTERFACE_CONTRACT]: 4,
                [LIBRARY_CONTRACT]: 5,
            };
            const NO_DOCS = [INTERFACE_CONTRACT];
            for (const contract of INPUT_CONTRACTS) {
                const cd = docs.contracts[contract];
                chai_1.expect(cd).to.exist('');
                if (NO_DOCS.includes(contract)) {
                    chai_1.expect(cd.doc).to.eq('');
                }
                else {
                    chai_1.expect(cd.doc).to.eq(createDocString(contract));
                }
                chai_1.expect(cd.line, `${contract}.line`).to.eq(contractLines[contract]);
            }
        }));
        it('extracts contract inheritance', () => __awaiter(void 0, void 0, void 0, function* () {
            const contractInherits = {
                [TEST_CONTRACT]: [BASE_CONTRACT, INTERFACE_CONTRACT],
                [BASE_CONTRACT]: [],
                [INTERFACE_CONTRACT]: [],
                [LIBRARY_CONTRACT]: [],
            };
            for (const contract of INPUT_CONTRACTS) {
                const cd = docs.contracts[contract];
                chai_1.expect(cd.inherits).to.deep.eq(contractInherits[contract]);
            }
        }));
    });
    describe('methods', () => {
        function assertMethodDocs(fullMethodName, props) {
            const [contractName, methodName] = fullMethodName.split('.');
            const m = docs.contracts[contractName].methods.find(_m => _m.name === methodName);
            {
                const doc = props.noDoc ? '' : createDocString(methodName);
                chai_1.expect(m).to.exist('');
                chai_1.expect(m.visibility).to.eq(props.visibility);
                chai_1.expect(m.contract).to.eq(contractName);
                chai_1.expect(m.doc).to.eq(doc);
            }
            const params = props.params || {};
            chai_1.expect(Object.keys(m.parameters), 'number of parameters').to.be.length(Object.keys(params).length);
            for (const [paramName, paramDoc] of Object.entries(params)) {
                const actualParam = m.parameters[paramName];
                const doc = paramDoc.noDoc ? '' : createDocString(paramName);
                const storage = paramDoc.storage === undefined ? extract_docs_1.StorageLocation.Default : paramDoc.storage;
                chai_1.expect(actualParam).to.exist('');
                chai_1.expect(actualParam.doc).to.eq(doc);
                chai_1.expect(actualParam.line).to.eq(paramDoc.line);
                chai_1.expect(actualParam.storageLocation).to.eq(storage);
                chai_1.expect(actualParam.type).to.eq(paramDoc.type);
            }
            const returns = props.returns || {};
            chai_1.expect(Object.keys(m.returns), 'number of returns').to.be.length(Object.keys(returns).length);
            for (const [returnName, returnDoc] of Object.entries(returns)) {
                const actualReturn = m.returns[returnName];
                const doc = returnDoc.noDoc ? '' : createDocString(returnName);
                const storage = returnDoc.storage === undefined ? extract_docs_1.StorageLocation.Default : returnDoc.storage;
                chai_1.expect(actualReturn).to.exist('');
                chai_1.expect(actualReturn.doc).to.eq(doc);
                chai_1.expect(actualReturn.line).to.eq(returnDoc.line);
                chai_1.expect(actualReturn.storageLocation).to.eq(storage);
                chai_1.expect(actualReturn.type).to.eq(returnDoc.type);
            }
        }
        describe('`TestContract`', () => {
            it('`testContractMethod1`', () => {
                assertMethodDocs('TestContract.testContractMethod1', {
                    line: 15,
                    visibility: extract_docs_1.Visibility.Public,
                });
            });
            it('`testContractMethod2`', () => {
                assertMethodDocs('TestContract.testContractMethod2', {
                    line: 15,
                    visibility: extract_docs_1.Visibility.Internal,
                    params: {
                        p1: {
                            line: 24,
                            type: 'address',
                        },
                        p2: {
                            line: 25,
                            type: 'uint256',
                        },
                        p3: {
                            line: 26,
                            type: 'LibraryContract.LibraryContractEnum',
                        },
                    },
                    returns: {
                        r1: {
                            line: 29,
                            type: 'int32',
                        },
                    },
                });
            });
            it('`testContractMethod3`', () => {
                assertMethodDocs('TestContract.testContractMethod3', {
                    line: 37,
                    visibility: extract_docs_1.Visibility.External,
                    params: {
                        p1: {
                            line: 37,
                            type: 'InterfaceContract.InterfaceStruct',
                            storage: extract_docs_1.StorageLocation.CallData,
                        },
                    },
                    returns: {
                        r1: {
                            line: 39,
                            type: 'bytes32[][]',
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                    },
                });
            });
            it('`testContractMethod4`', () => {
                assertMethodDocs('TestContract.testContractMethod4', {
                    line: 45,
                    visibility: extract_docs_1.Visibility.Private,
                    params: {
                        p1: {
                            line: 46,
                            type: 'LibraryContract.LibraryStruct[]',
                            noDoc: true,
                            storage: extract_docs_1.StorageLocation.Storage,
                        },
                        p2: {
                            line: 47,
                            type: 'InterfaceContract.InterfaceStruct[]',
                            noDoc: true,
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                        p3: {
                            line: 48,
                            type: 'bytes[]',
                            noDoc: true,
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                    },
                    returns: {
                        r1: {
                            line: 51,
                            type: 'bytes',
                            noDoc: true,
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                        r2: {
                            line: 51,
                            type: 'bytes',
                            noDoc: true,
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                    },
                });
            });
        });
        describe('`BaseContract`', () => {
            it('`baseContractMethod1`', () => {
                assertMethodDocs('BaseContract.baseContractMethod1', {
                    line: 36,
                    visibility: extract_docs_1.Visibility.Internal,
                    params: {
                        p1: {
                            line: 39,
                            type: 'bytes',
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                        p2: {
                            line: 39,
                            type: 'bytes32',
                        },
                    },
                    returns: {
                        '0': {
                            line: 41,
                            type: 'InterfaceContract.InterfaceStruct',
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                    },
                });
            });
            it('`baseContractField1`', () => {
                assertMethodDocs('BaseContract.baseContractField1', {
                    line: 26,
                    visibility: extract_docs_1.Visibility.External,
                    params: {
                        '0': {
                            line: 26,
                            type: 'bytes32',
                        },
                        '1': {
                            line: 26,
                            type: 'address',
                        },
                    },
                    returns: {
                        '0': {
                            line: 26,
                            type: 'InterfaceContract.InterfaceStruct',
                            storage: extract_docs_1.StorageLocation.Memory,
                        },
                    },
                });
            });
            it('`baseContractField2`', () => {
                assertMethodDocs('BaseContract.baseContractField2', {
                    line: 30,
                    visibility: extract_docs_1.Visibility.External,
                    params: {
                        '0': {
                            line: 30,
                            type: 'uint256',
                        },
                    },
                    returns: {
                        '0': {
                            noDoc: true,
                            line: 30,
                            type: 'bytes32',
                        },
                    },
                });
            });
            it('`baseContractField3`', () => {
                // This field is private so no method should exist for it.
                chai_1.expect(docs.contracts.TestContract.events.find(e => e.name === 'baseContractField3')).to.eq(undefined);
            });
        });
    });
    describe('events', () => {
        function assertEventDocs(fullEventName, props) {
            const [contractName, eventName] = fullEventName.split('.');
            const e = docs.contracts[contractName].events.find(_e => _e.name === eventName);
            {
                const doc = props.noDoc ? '' : createDocString(eventName);
                chai_1.expect(e).to.exist('');
                chai_1.expect(e.contract).to.eq(contractName);
                chai_1.expect(e.doc).to.eq(doc);
            }
            const params = props.params || {};
            chai_1.expect(Object.keys(e.parameters), 'number of parameters').to.be.length(Object.keys(params).length);
            for (const [paramName, paramDoc] of Object.entries(params)) {
                const actualParam = e.parameters[paramName];
                const doc = paramDoc.noDoc ? '' : createDocString(paramName);
                const isIndexed = paramDoc.indexed === undefined ? false : paramDoc.indexed;
                chai_1.expect(actualParam).to.exist('');
                chai_1.expect(actualParam.doc).to.eq(doc);
                chai_1.expect(actualParam.line).to.eq(paramDoc.line);
                chai_1.expect(actualParam.indexed).to.eq(isIndexed);
                chai_1.expect(actualParam.type).to.eq(paramDoc.type);
            }
        }
        describe('`BaseContract`', () => {
            it('`BaseContractEvent1`', () => {
                assertEventDocs('BaseContract.BaseContractEvent1', {
                    line: 14,
                    params: {
                        p1: {
                            line: 14,
                            type: 'address',
                            indexed: true,
                        },
                        p2: {
                            line: 14,
                            type: 'InterfaceContract.InterfaceStruct',
                        },
                    },
                });
            });
            it('`BaseContractEvent2`', () => {
                assertEventDocs('BaseContract.BaseContractEvent2', {
                    line: 16,
                    params: {
                        p1: {
                            line: 17,
                            type: 'uint256',
                            noDoc: true,
                        },
                        p2: {
                            line: 18,
                            type: 'uint256',
                            indexed: true,
                            noDoc: true,
                        },
                    },
                });
            });
        });
    });
    describe('enums', () => {
        function assertEnumDocs(fullEnumName, props) {
            const [contractName, enumName] = fullEnumName.split('.');
            const e = docs.contracts[contractName].enums[`${contractName}.${enumName}`];
            {
                const doc = props.noDoc ? '' : createDocString(enumName);
                chai_1.expect(e).to.exist('');
                chai_1.expect(e.contract).to.eq(contractName);
                chai_1.expect(e.doc).to.eq(doc);
            }
            const values = props.values || {};
            chai_1.expect(Object.keys(e.values), 'number of values').to.be.length(Object.keys(values).length);
            for (const [valueName, valueDoc] of Object.entries(values)) {
                const actualValue = e.values[valueName];
                const doc = valueDoc.noDoc ? '' : createDocString(valueName);
                chai_1.expect(actualValue).to.exist('');
                chai_1.expect(actualValue.doc).to.eq(doc);
                chai_1.expect(actualValue.line).to.eq(valueDoc.line);
                chai_1.expect(actualValue.value).to.eq(valueDoc.value);
            }
        }
        describe('`LibraryContract`', () => {
            it('`LibraryContractEnum`', () => {
                assertEnumDocs('LibraryContract.LibraryContractEnum', {
                    line: 9,
                    values: {
                        EnumMember1: {
                            line: 10,
                            value: 0,
                        },
                        EnumMember2: {
                            line: 11,
                            value: 1,
                        },
                        EnumMember3: {
                            line: 13,
                            value: 2,
                        },
                        EnumMember4: {
                            noDoc: true,
                            line: 14,
                            value: 3,
                        },
                    },
                });
            });
        });
    });
    describe('structs', () => {
        function assertStructDocs(fullStructName, props) {
            const [contractName, structName] = fullStructName.split('.');
            const s = docs.contracts[contractName].structs[`${contractName}.${structName}`];
            {
                const doc = props.noDoc ? '' : createDocString(structName);
                chai_1.expect(s).to.exist('');
                chai_1.expect(s.contract).to.eq(contractName);
                chai_1.expect(s.doc).to.eq(doc);
            }
            const fields = props.fields || {};
            chai_1.expect(Object.keys(s.fields), 'number of fields').to.be.length(Object.keys(fields).length);
            for (const [fieldName, fieldDoc] of Object.entries(fields)) {
                const actualField = s.fields[fieldName];
                const doc = fieldDoc.noDoc ? '' : createDocString(fieldName);
                chai_1.expect(actualField).to.exist('');
                chai_1.expect(actualField.doc).to.eq(doc);
                chai_1.expect(actualField.line).to.eq(fieldDoc.line);
                chai_1.expect(actualField.type).to.eq(fieldDoc.type);
                chai_1.expect(actualField.storageLocation).to.eq(extract_docs_1.StorageLocation.Default);
                chai_1.expect(actualField.indexed).to.eq(false);
            }
        }
        describe('`LibraryContract`', () => {
            it('`LibraryStruct`', () => {
                assertStructDocs('LibraryContract.LibraryStruct', {
                    line: 19,
                    fields: {
                        structField: {
                            line: 20,
                            type: 'mapping(bytes32 => address)',
                            order: 0,
                        },
                    },
                });
            });
        });
        describe('`InterfaceContract`', () => {
            it('`InterfaceStruct`', () => {
                assertStructDocs('InterfaceContract.InterfaceStruct', {
                    line: 9,
                    fields: {
                        structField1: {
                            line: 9,
                            type: 'address',
                            order: 0,
                        },
                        structField2: {
                            line: 10,
                            type: 'uint256',
                            order: 1,
                        },
                        structField3: {
                            line: 12,
                            type: 'bytes32',
                            order: 2,
                        },
                    },
                });
            });
        });
    });
});
// tslint:disable: max-file-line-count
//# sourceMappingURL=extract_docs_test.js.map