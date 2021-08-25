"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomContract = exports.randomEnum = exports.randomStruct = exports.randomMethod = exports.randomEvent = exports.randomParameter = exports.randomParameters = exports.randomFunctionKind = exports.randomVisibility = exports.randomMutability = exports.randomContractKind = exports.randomStorageLocation = exports.randomType = exports.randomBoolean = exports.randomDocs = exports.randomSentence = exports.randomWord = void 0;
const _ = require("lodash");
const extract_docs_1 = require("../../src/extract_docs");
// tslint:disable: custom-no-magic-numbers completed-docs
const LETTERS = _.times(26, n => String.fromCharCode('a'.charCodeAt(0) + n));
function randomWord(maxLength = 13) {
    return _.sampleSize(LETTERS, _.random(1, maxLength)).join('');
}
exports.randomWord = randomWord;
function randomSentence() {
    const numWords = _.random(3, 64);
    return _.capitalize(_.times(numWords, () => randomWord())
        .join(' ')
        .concat('.'));
}
exports.randomSentence = randomSentence;
function randomDocs() {
    return {
        doc: randomSentence(),
        line: _.random(1, 65536),
        file: _.capitalize(randomWord()).concat('.sol'),
    };
}
exports.randomDocs = randomDocs;
function randomBoolean() {
    return _.random(0, 1) === 1;
}
exports.randomBoolean = randomBoolean;
function randomType() {
    return _.sampleSize(['uint256', 'bytes32', 'bool', 'uint32', 'int256', 'int64', 'uint8'], 1)[0];
}
exports.randomType = randomType;
function randomStorageLocation() {
    return _.sampleSize([extract_docs_1.StorageLocation.Default, extract_docs_1.StorageLocation.Memory, extract_docs_1.StorageLocation.Storage])[0];
}
exports.randomStorageLocation = randomStorageLocation;
function randomContractKind() {
    return _.sampleSize([extract_docs_1.ContractKind.Contract, extract_docs_1.ContractKind.Interface, extract_docs_1.ContractKind.Library])[0];
}
exports.randomContractKind = randomContractKind;
function randomMutability() {
    return _.sampleSize([
        extract_docs_1.StateMutability.Nonpayable,
        extract_docs_1.StateMutability.Payable,
        extract_docs_1.StateMutability.Pure,
        extract_docs_1.StateMutability.View,
    ])[0];
}
exports.randomMutability = randomMutability;
function randomVisibility() {
    return _.sampleSize([extract_docs_1.Visibility.External, extract_docs_1.Visibility.Internal, extract_docs_1.Visibility.Public, extract_docs_1.Visibility.Private])[0];
}
exports.randomVisibility = randomVisibility;
function randomFunctionKind() {
    return _.sampleSize([extract_docs_1.FunctionKind.Constructor, extract_docs_1.FunctionKind.Fallback, extract_docs_1.FunctionKind.Function])[0];
}
exports.randomFunctionKind = randomFunctionKind;
function randomParameters() {
    const numParams = _.random(0, 7);
    return _.zipObject(_.times(numParams, () => randomWord()), _.times(numParams, idx => randomParameter(idx)));
}
exports.randomParameters = randomParameters;
function randomParameter(order, fields) {
    return Object.assign(Object.assign(Object.assign({}, randomDocs()), { type: randomType(), indexed: randomBoolean(), storageLocation: randomStorageLocation(), order }), fields);
}
exports.randomParameter = randomParameter;
function randomEvent(fields) {
    return Object.assign(Object.assign(Object.assign({}, randomDocs()), { contract: `${randomWord()}Contract`, name: `${randomWord()}Event`, parameters: randomParameters() }), fields);
}
exports.randomEvent = randomEvent;
function randomMethod(fields) {
    return Object.assign(Object.assign(Object.assign({}, randomDocs()), { contract: `${randomWord()}Contract`, name: `${randomWord()}Method`, kind: randomFunctionKind(), isAccessor: randomBoolean(), stateMutability: randomMutability(), visibility: randomVisibility(), returns: randomParameters(), parameters: randomParameters() }), fields);
}
exports.randomMethod = randomMethod;
function randomStruct(fields) {
    return Object.assign(Object.assign(Object.assign({}, randomDocs()), { contract: `${randomWord()}Contract`, fields: randomParameters() }), fields);
}
exports.randomStruct = randomStruct;
function randomEnum(fields) {
    return Object.assign(Object.assign(Object.assign({}, randomDocs()), { contract: `${randomWord()}Contract`, values: _.mapValues(_.groupBy(_.times(_.random(1, 8), i => (Object.assign(Object.assign({}, randomDocs()), { value: i, name: randomWord() }))), 'name'), v => _.omit(v[0], 'name')) }), fields);
}
exports.randomEnum = randomEnum;
function randomContract(contractName, fields) {
    return Object.assign(Object.assign(Object.assign({}, randomDocs()), { kind: randomContractKind(), inherits: [], events: _.times(_.random(1, 4), () => randomEvent({ contract: contractName })), methods: _.times(_.random(1, 4), () => randomMethod({ contract: contractName })), structs: _.mapValues(_.groupBy(_.times(_.random(1, 4), () => (Object.assign(Object.assign({}, randomStruct({ contract: contractName })), { name: `${randomWord()}Struct` }))), 'name'), v => _.omit(v[0], 'name')), enums: _.mapValues(_.groupBy(_.times(_.random(1, 4), () => (Object.assign(Object.assign({}, randomEnum({ contract: contractName })), { name: `${randomWord()}Enum` }))), 'name'), v => _.omit(v[0], 'name')) }), fields);
}
exports.randomContract = randomContract;
//# sourceMappingURL=random_docs.js.map