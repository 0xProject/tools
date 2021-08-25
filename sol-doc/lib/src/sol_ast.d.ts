export declare enum AstNodeType {
    SourceUnit = "SourceUnit",
    ContractDefinition = "ContractDefinition",
    FunctionDefinition = "FunctionDefinition",
    ParameterList = "ParameterList",
    VariableDeclaration = "VariableDeclaration",
    UserDefinedTypeName = "UserDefinedTypeName",
    ElementaryTypeName = "ElementaryTypeName",
    ArrayTypeName = "ArrayTypeName",
    Mapping = "Mapping",
    StructDefinition = "StructDefinition",
    EnumDefinition = "EnumDefinition",
    EnumValue = "EnumValue",
    InheritanceSpecifier = "InheritanceSpecifier",
    EventDefinition = "EventDefinition"
}
export declare enum Visibility {
    Internal = "internal",
    External = "external",
    Public = "public",
    Private = "private"
}
export declare enum StateMutability {
    Nonpayable = "nonpayable",
    Payable = "payable",
    View = "view",
    Pure = "pure"
}
export declare enum FunctionKind {
    Constructor = "constructor",
    Function = "function",
    Fallback = "fallback"
}
export declare enum ContractKind {
    Contract = "contract",
    Interface = "interface",
    Library = "library"
}
export declare enum StorageLocation {
    Default = "default",
    Storage = "storage",
    Memory = "memory",
    CallData = "calldata"
}
export interface AstNode {
    id: number;
    nodeType: AstNodeType;
    src: string;
}
export interface SourceUnitNode extends AstNode {
    path: string;
    nodes: AstNode[];
    exportedSymbols: {
        [symbol: string]: number[];
    };
}
export interface ContractDefinitionNode extends AstNode {
    name: string;
    contractKind: ContractKind;
    fullyImplemented: boolean;
    linearizedBaseContracts: number[];
    contractDependencies: number[];
    baseContracts: InheritanceSpecifierNode[];
    nodes: AstNode[];
}
export interface InheritanceSpecifierNode extends AstNode {
    baseName: UserDefinedTypeNameNode;
}
export interface FunctionDefinitionNode extends AstNode {
    name: string;
    implemented: boolean;
    scope: number;
    kind: FunctionKind;
    parameters: ParameterListNode;
    returnParameters: ParameterListNode;
    visibility: Visibility;
    stateMutability: StateMutability;
}
export interface ParameterListNode extends AstNode {
    parameters: VariableDeclarationNode[];
}
export interface VariableDeclarationNode extends AstNode {
    name: string;
    value: AstNode | null;
    constant: boolean;
    scope: number;
    visibility: Visibility;
    stateVariable: boolean;
    storageLocation: StorageLocation;
    indexed: boolean;
    typeName: TypeNameNode;
}
export interface TypeNameNode extends AstNode {
    name: string;
    typeDescriptions: {
        typeIdentifier: string;
        typeString: string;
    };
}
export interface UserDefinedTypeNameNode extends TypeNameNode {
    referencedDeclaration: number;
}
export interface MappingTypeNameNode extends TypeNameNode {
    keyType: ElementaryTypeNameNode;
    valueType: TypeNameNode;
}
export interface ElementaryTypeNameNode extends TypeNameNode {
}
export interface ArrayTypeNameNode extends TypeNameNode {
    length: number | null;
    baseType: TypeNameNode;
}
export interface StructDefinitionNode extends AstNode {
    scope: number;
    name: string;
    canonicalName: string;
    members: VariableDeclarationNode[];
}
export interface EnumDefinitionNode extends AstNode {
    name: string;
    canonicalName: string;
    members: EnumValueNode[];
}
export interface EnumValueNode extends AstNode {
    name: string;
}
export interface EventDefinitionNode extends AstNode {
    name: string;
    parameters: ParameterListNode;
}
/**
 * Check if a node is a SourceUnit node.
 */
export declare function isSourceUnitNode(node: AstNode): node is SourceUnitNode;
/**
 * Check if a node is a ContractDefinition ode.
 */
export declare function isContractDefinitionNode(node: AstNode): node is ContractDefinitionNode;
/**
 * Check if a node is a VariableDeclaration ode.
 */
export declare function isVariableDeclarationNode(node: AstNode): node is VariableDeclarationNode;
/**
 * Check if a node is a FunctionDefinition node.
 */
export declare function isFunctionDefinitionNode(node: AstNode): node is FunctionDefinitionNode;
/**
 * Check if a node is a StructDefinition ode.
 */
export declare function isStructDefinitionNode(node: AstNode): node is StructDefinitionNode;
/**
 * Check if a node is a EnumDefinition ode.
 */
export declare function isEnumDefinitionNode(node: AstNode): node is EnumDefinitionNode;
/**
 * Check if a node is a Mapping node.
 */
export declare function isMappingTypeNameNode(node: AstNode): node is MappingTypeNameNode;
/**
 * Check if a node is a ArrayTypeName node.
 */
export declare function isArrayTypeNameNode(node: AstNode): node is ArrayTypeNameNode;
/**
 * Check if a node is a UserDefinedTypeName node.
 */
export declare function isUserDefinedTypeNameNode(node: AstNode): node is UserDefinedTypeNameNode;
/**
 * Check if a node is a EventDefinition node.
 */
export declare function isEventDefinitionNode(node: AstNode): node is EventDefinitionNode;
/**
 * Split an AST source mapping string into its parts.
 */
export declare function splitAstNodeSrc(src: string): {
    offset: number;
    length: number;
    sourceId: number;
};
//# sourceMappingURL=sol_ast.d.ts.map