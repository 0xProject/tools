"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dev_utils_1 = require("@0x/dev-utils");
const chai_1 = require("chai");
const _ = require("lodash");
const extract_docs_1 = require("../src/extract_docs");
const transform_docs_1 = require("../src/transform_docs");
const random_docs_1 = require("./utils/random_docs");
dev_utils_1.chaiSetup.configure();
// tslint:disable: custom-no-magic-numbers
describe('transformDocs()', () => {
    const INTERFACE_CONTRACT = 'InterfaceContract';
    const TEST_CONTRACT = 'TestContract';
    const BASE_CONTRACT = 'BaseContract';
    const OTHER_CONTRACT = 'OtherContract';
    const LIBRARY_CONTRACT = 'LibraryContract';
    const LIBRARY_EVENT = 'LibraryContract.LibraryEvent';
    const INTERFACE_EVENT = 'InterfaceContract.InterfaceEvent';
    const BASE_CONTRACT_EVENT = 'BaseContract.BaseContractEvent';
    const LIBRARY_ENUM = 'LibraryContract.LibraryEnum';
    const INTERFACE_ENUM = 'InterfaceContract.InterfaceEnum';
    const BASE_CONTRACT_ENUM = 'BaseContract.BaseContractEnum';
    const LIBRARY_STRUCT = 'LibraryContract.LibraryStruct';
    const INTERFACE_STRUCT = 'InterfaceContract.InterfaceStruct';
    const BASE_CONTRACT_STRUCT = 'BaseContract.BaseContractStruct';
    const OTHER_CONTRACT_STRUCT = 'OtherContract.OtherContractStruct';
    const INPUT_DOCS = {
        contracts: {
            [LIBRARY_CONTRACT]: _.merge(random_docs_1.randomContract(LIBRARY_CONTRACT, { kind: extract_docs_1.ContractKind.Library }), {
                events: {
                    [LIBRARY_EVENT]: random_docs_1.randomEvent({ contract: LIBRARY_CONTRACT }),
                },
                structs: {
                    [LIBRARY_STRUCT]: random_docs_1.randomStruct({ contract: LIBRARY_CONTRACT }),
                },
                enums: {
                    [LIBRARY_ENUM]: random_docs_1.randomEnum({ contract: LIBRARY_CONTRACT }),
                },
            }),
            [INTERFACE_CONTRACT]: _.merge(random_docs_1.randomContract(INTERFACE_CONTRACT, { kind: extract_docs_1.ContractKind.Interface }), {
                events: {
                    [INTERFACE_EVENT]: random_docs_1.randomEvent({ contract: INTERFACE_CONTRACT }),
                },
                structs: {
                    [INTERFACE_STRUCT]: random_docs_1.randomStruct({ contract: INTERFACE_CONTRACT }),
                },
                enums: {
                    [INTERFACE_ENUM]: random_docs_1.randomEnum({ contract: INTERFACE_CONTRACT }),
                },
            }),
            [BASE_CONTRACT]: _.merge(random_docs_1.randomContract(BASE_CONTRACT, { kind: extract_docs_1.ContractKind.Contract }), {
                events: {
                    [BASE_CONTRACT_EVENT]: random_docs_1.randomEvent({ contract: BASE_CONTRACT }),
                },
                structs: {
                    [BASE_CONTRACT_STRUCT]: random_docs_1.randomStruct({ contract: BASE_CONTRACT }),
                },
                enums: {
                    [BASE_CONTRACT_ENUM]: random_docs_1.randomEnum({ contract: BASE_CONTRACT }),
                },
            }),
            [TEST_CONTRACT]: _.merge(random_docs_1.randomContract(TEST_CONTRACT, { kind: extract_docs_1.ContractKind.Contract, inherits: [BASE_CONTRACT] }), {
                methods: [
                    random_docs_1.randomMethod({
                        contract: TEST_CONTRACT,
                        visibility: extract_docs_1.Visibility.External,
                        parameters: {
                            [random_docs_1.randomWord()]: random_docs_1.randomParameter(0, { type: INTERFACE_ENUM }),
                        },
                    }),
                    random_docs_1.randomMethod({
                        contract: TEST_CONTRACT,
                        visibility: extract_docs_1.Visibility.Private,
                        parameters: {
                            [random_docs_1.randomWord()]: random_docs_1.randomParameter(0, { type: LIBRARY_STRUCT }),
                        },
                    }),
                ],
            }),
            [OTHER_CONTRACT]: _.merge(random_docs_1.randomContract(OTHER_CONTRACT, { kind: extract_docs_1.ContractKind.Contract }), {
                structs: {
                    [OTHER_CONTRACT_STRUCT]: random_docs_1.randomStruct({
                        contract: OTHER_CONTRACT,
                        fields: {
                            [random_docs_1.randomWord()]: random_docs_1.randomParameter(0, { type: LIBRARY_ENUM }),
                        },
                    }),
                },
                methods: [
                    random_docs_1.randomMethod({
                        contract: OTHER_CONTRACT,
                        visibility: extract_docs_1.Visibility.Public,
                        returns: {
                            [random_docs_1.randomWord()]: random_docs_1.randomParameter(0, { type: OTHER_CONTRACT_STRUCT }),
                        },
                    }),
                    random_docs_1.randomMethod({
                        contract: OTHER_CONTRACT,
                        visibility: extract_docs_1.Visibility.Internal,
                        returns: {
                            [random_docs_1.randomWord()]: random_docs_1.randomParameter(0, { type: INTERFACE_STRUCT }),
                        },
                    }),
                ],
                events: [
                    random_docs_1.randomEvent({
                        contract: OTHER_CONTRACT,
                        parameters: {
                            [random_docs_1.randomWord()]: random_docs_1.randomParameter(0, { type: LIBRARY_STRUCT }),
                        },
                    }),
                ],
            }),
        },
    };
    function getMethodId(method) {
        if (method.kind === extract_docs_1.FunctionKind.Constructor) {
            return 'constructor';
        }
        return getEventId(method);
    }
    function getEventId(method) {
        const paramsTypes = Object.values(method.parameters).map(p => p.type);
        return `${method.name}(${paramsTypes.join(',')})`;
    }
    function getAllTypes(docs) {
        const allTypes = [];
        for (const contract of Object.values(docs.contracts)) {
            for (const structName of Object.keys(contract.structs)) {
                allTypes.push(structName);
            }
            for (const enumName of Object.keys(contract.enums)) {
                allTypes.push(enumName);
            }
        }
        return allTypes;
    }
    it('returns all contracts with no target contracts', () => {
        const docs = transform_docs_1.transformDocs(INPUT_DOCS);
        chai_1.expect(Object.keys(docs.contracts)).to.deep.eq([
            LIBRARY_CONTRACT,
            INTERFACE_CONTRACT,
            BASE_CONTRACT,
            TEST_CONTRACT,
            OTHER_CONTRACT,
        ]);
    });
    it('returns requested AND related contracts', () => {
        const contracts = [TEST_CONTRACT, OTHER_CONTRACT];
        const docs = transform_docs_1.transformDocs(INPUT_DOCS, { contracts });
        chai_1.expect(Object.keys(docs.contracts)).to.deep.eq([LIBRARY_CONTRACT, INTERFACE_CONTRACT, ...contracts]);
    });
    it('returns exposed and unexposed items by default', () => {
        const contracts = [TEST_CONTRACT];
        const docs = transform_docs_1.transformDocs(INPUT_DOCS, { contracts });
        chai_1.expect(Object.keys(docs.contracts)).to.deep.eq([LIBRARY_CONTRACT, INTERFACE_CONTRACT, ...contracts]);
        const allTypes = getAllTypes(docs);
        // Check for an exposed type.
        chai_1.expect(allTypes).to.include(INTERFACE_ENUM);
        // Check for an unexposed type.
        chai_1.expect(allTypes).to.include(LIBRARY_STRUCT);
    });
    it('can hide unexposed items', () => {
        const contracts = [OTHER_CONTRACT];
        const docs = transform_docs_1.transformDocs(INPUT_DOCS, { contracts, onlyExposed: true });
        chai_1.expect(Object.keys(docs.contracts)).to.deep.eq([LIBRARY_CONTRACT, ...contracts]);
        const allTypes = getAllTypes(docs);
        // Check for an exposed type.
        chai_1.expect(allTypes).to.include(LIBRARY_ENUM);
        // Check for an unexposed type.
        chai_1.expect(allTypes).to.not.include(INTERFACE_STRUCT);
    });
    describe('flattening', () => {
        it('merges inherited methods', () => {
            const docs = transform_docs_1.transformDocs(INPUT_DOCS, { contracts: [TEST_CONTRACT], flatten: true });
            const allMethods = _.uniqBy(_.flatten([BASE_CONTRACT, TEST_CONTRACT].map(c => INPUT_DOCS.contracts[c].methods.filter(m => m.visibility !== extract_docs_1.Visibility.Private))), m => getMethodId(m));
            const outputMethods = docs.contracts[TEST_CONTRACT].methods;
            chai_1.expect(outputMethods).to.length(allMethods.length);
            for (const method of outputMethods) {
                chai_1.expect(allMethods.map(m => getMethodId(m))).to.include(getMethodId(method));
            }
        });
        it('merges inherited events', () => {
            const docs = transform_docs_1.transformDocs(INPUT_DOCS, { contracts: [TEST_CONTRACT], flatten: true });
            const allEvents = _.uniqBy(_.flatten([BASE_CONTRACT, TEST_CONTRACT].map(c => INPUT_DOCS.contracts[c].events)), e => getEventId(e));
            const outputEvents = docs.contracts[TEST_CONTRACT].events;
            chai_1.expect(outputEvents).to.length(allEvents.length);
            for (const event of outputEvents) {
                chai_1.expect(allEvents.map(m => getEventId(m))).to.include(getEventId(event));
            }
        });
    });
});
//# sourceMappingURL=transform_docs_test.js.map