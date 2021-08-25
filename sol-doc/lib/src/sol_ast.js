"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitAstNodeSrc = exports.isEventDefinitionNode = exports.isUserDefinedTypeNameNode = exports.isArrayTypeNameNode = exports.isMappingTypeNameNode = exports.isEnumDefinitionNode = exports.isStructDefinitionNode = exports.isFunctionDefinitionNode = exports.isVariableDeclarationNode = exports.isContractDefinitionNode = exports.isSourceUnitNode = exports.StorageLocation = exports.ContractKind = exports.FunctionKind = exports.StateMutability = exports.Visibility = exports.AstNodeType = void 0;
var AstNodeType;
(function (AstNodeType) {
    AstNodeType["SourceUnit"] = "SourceUnit";
    AstNodeType["ContractDefinition"] = "ContractDefinition";
    AstNodeType["FunctionDefinition"] = "FunctionDefinition";
    AstNodeType["ParameterList"] = "ParameterList";
    AstNodeType["VariableDeclaration"] = "VariableDeclaration";
    AstNodeType["UserDefinedTypeName"] = "UserDefinedTypeName";
    AstNodeType["ElementaryTypeName"] = "ElementaryTypeName";
    AstNodeType["ArrayTypeName"] = "ArrayTypeName";
    AstNodeType["Mapping"] = "Mapping";
    AstNodeType["StructDefinition"] = "StructDefinition";
    AstNodeType["EnumDefinition"] = "EnumDefinition";
    AstNodeType["EnumValue"] = "EnumValue";
    AstNodeType["InheritanceSpecifier"] = "InheritanceSpecifier";
    AstNodeType["EventDefinition"] = "EventDefinition";
})(AstNodeType = exports.AstNodeType || (exports.AstNodeType = {}));
var Visibility;
(function (Visibility) {
    Visibility["Internal"] = "internal";
    Visibility["External"] = "external";
    Visibility["Public"] = "public";
    Visibility["Private"] = "private";
})(Visibility = exports.Visibility || (exports.Visibility = {}));
var StateMutability;
(function (StateMutability) {
    StateMutability["Nonpayable"] = "nonpayable";
    StateMutability["Payable"] = "payable";
    StateMutability["View"] = "view";
    StateMutability["Pure"] = "pure";
})(StateMutability = exports.StateMutability || (exports.StateMutability = {}));
var FunctionKind;
(function (FunctionKind) {
    FunctionKind["Constructor"] = "constructor";
    FunctionKind["Function"] = "function";
    FunctionKind["Fallback"] = "fallback";
})(FunctionKind = exports.FunctionKind || (exports.FunctionKind = {}));
var ContractKind;
(function (ContractKind) {
    ContractKind["Contract"] = "contract";
    ContractKind["Interface"] = "interface";
    ContractKind["Library"] = "library";
})(ContractKind = exports.ContractKind || (exports.ContractKind = {}));
var StorageLocation;
(function (StorageLocation) {
    StorageLocation["Default"] = "default";
    StorageLocation["Storage"] = "storage";
    StorageLocation["Memory"] = "memory";
    StorageLocation["CallData"] = "calldata";
})(StorageLocation = exports.StorageLocation || (exports.StorageLocation = {}));
/**
 * Check if a node is a SourceUnit node.
 */
function isSourceUnitNode(node) {
    return node.nodeType === AstNodeType.SourceUnit;
}
exports.isSourceUnitNode = isSourceUnitNode;
/**
 * Check if a node is a ContractDefinition ode.
 */
function isContractDefinitionNode(node) {
    return node.nodeType === AstNodeType.ContractDefinition;
}
exports.isContractDefinitionNode = isContractDefinitionNode;
/**
 * Check if a node is a VariableDeclaration ode.
 */
function isVariableDeclarationNode(node) {
    return node.nodeType === AstNodeType.VariableDeclaration;
}
exports.isVariableDeclarationNode = isVariableDeclarationNode;
/**
 * Check if a node is a FunctionDefinition node.
 */
function isFunctionDefinitionNode(node) {
    return node.nodeType === AstNodeType.FunctionDefinition;
}
exports.isFunctionDefinitionNode = isFunctionDefinitionNode;
/**
 * Check if a node is a StructDefinition ode.
 */
function isStructDefinitionNode(node) {
    return node.nodeType === AstNodeType.StructDefinition;
}
exports.isStructDefinitionNode = isStructDefinitionNode;
/**
 * Check if a node is a EnumDefinition ode.
 */
function isEnumDefinitionNode(node) {
    return node.nodeType === AstNodeType.EnumDefinition;
}
exports.isEnumDefinitionNode = isEnumDefinitionNode;
/**
 * Check if a node is a Mapping node.
 */
function isMappingTypeNameNode(node) {
    return node.nodeType === AstNodeType.Mapping;
}
exports.isMappingTypeNameNode = isMappingTypeNameNode;
/**
 * Check if a node is a ArrayTypeName node.
 */
function isArrayTypeNameNode(node) {
    return node.nodeType === AstNodeType.ArrayTypeName;
}
exports.isArrayTypeNameNode = isArrayTypeNameNode;
/**
 * Check if a node is a UserDefinedTypeName node.
 */
function isUserDefinedTypeNameNode(node) {
    return node.nodeType === AstNodeType.UserDefinedTypeName;
}
exports.isUserDefinedTypeNameNode = isUserDefinedTypeNameNode;
/**
 * Check if a node is a EventDefinition node.
 */
function isEventDefinitionNode(node) {
    return node.nodeType === AstNodeType.EventDefinition;
}
exports.isEventDefinitionNode = isEventDefinitionNode;
/**
 * Split an AST source mapping string into its parts.
 */
function splitAstNodeSrc(src) {
    // tslint:disable-next-line: custom-no-magic-numbers
    const [offset, length, sourceId] = src.split(':').map(s => parseInt(s, 10));
    return { offset, length, sourceId };
}
exports.splitAstNodeSrc = splitAstNodeSrc;
// tslint:disable-next-line: max-file-line-count
//# sourceMappingURL=sol_ast.js.map