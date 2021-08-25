import { ContractKind, FunctionKind, StorageLocation, Visibility } from './sol_ast';
export { ContractKind, FunctionKind, StateMutability, StorageLocation, Visibility } from './sol_ast';
export interface DocumentedItem {
    doc: string;
    line: number;
    file: string;
}
export interface EnumValueDocs extends DocumentedItem {
    value: number;
}
export interface ParamDocs extends DocumentedItem {
    type: string;
    indexed: boolean;
    storageLocation: StorageLocation;
    order: number;
}
export interface ParamDocsMap {
    [name: string]: ParamDocs;
}
export interface EnumValueDocsMap {
    [name: string]: EnumValueDocs;
}
export interface MethodDocs extends DocumentedItem {
    name: string;
    contract: string;
    stateMutability: string;
    visibility: Visibility;
    isAccessor: boolean;
    kind: FunctionKind;
    parameters: ParamDocsMap;
    returns: ParamDocsMap;
}
export interface EnumDocs extends DocumentedItem {
    contract: string;
    values: EnumValueDocsMap;
}
export interface StructDocs extends DocumentedItem {
    contract: string;
    fields: ParamDocsMap;
}
export interface EventDocs extends DocumentedItem {
    contract: string;
    name: string;
    parameters: ParamDocsMap;
}
export interface ContractDocs extends DocumentedItem {
    kind: ContractKind;
    inherits: string[];
    methods: MethodDocs[];
    events: EventDocs[];
    enums: {
        [typeName: string]: EnumDocs;
    };
    structs: {
        [typeName: string]: StructDocs;
    };
}
export interface SolidityDocs {
    contracts: {
        [typeName: string]: ContractDocs;
    };
}
/**
 * Extract documentation, as JSON, from contract files.
 */
export declare function extractDocsAsync(contractPaths: string[], roots?: string[]): Promise<SolidityDocs>;
//# sourceMappingURL=extract_docs.d.ts.map