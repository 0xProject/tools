import { ContractDocs, ContractKind, DocumentedItem, EnumDocs, EventDocs, FunctionKind, MethodDocs, ParamDocs, ParamDocsMap, StateMutability, StorageLocation, StructDocs, Visibility } from '../../src/extract_docs';
export declare function randomWord(maxLength?: number): string;
export declare function randomSentence(): string;
export declare function randomDocs(): DocumentedItem;
export declare function randomBoolean(): boolean;
export declare function randomType(): string;
export declare function randomStorageLocation(): StorageLocation;
export declare function randomContractKind(): ContractKind;
export declare function randomMutability(): StateMutability;
export declare function randomVisibility(): Visibility;
export declare function randomFunctionKind(): FunctionKind;
export declare function randomParameters(): ParamDocsMap;
export declare function randomParameter(order: number, fields?: Partial<ParamDocs>): ParamDocs;
export declare function randomEvent(fields?: Partial<EventDocs>): EventDocs;
export declare function randomMethod(fields?: Partial<MethodDocs>): MethodDocs;
export declare function randomStruct(fields?: Partial<StructDocs>): StructDocs;
export declare function randomEnum(fields?: Partial<EnumDocs>): EnumDocs;
export declare function randomContract(contractName: string, fields?: Partial<ContractDocs>): ContractDocs;
//# sourceMappingURL=random_docs.d.ts.map