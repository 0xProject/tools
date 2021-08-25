/// <reference types="node" />
export declare enum AbiType {
    Function = "function",
    Constructor = "constructor",
    Event = "event",
    Fallback = "fallback"
}
export interface SolcErrors {
    [key: string]: boolean;
}
export interface ContractSourceData {
    [contractName: string]: ContractSpecificSourceData;
}
export interface BinaryPaths {
    [key: string]: string;
}
export interface ContractSpecificSourceData {
    solcVersionRange: string;
    sourceHash: Buffer;
    sourceTreeHash: Buffer;
}
export interface Token {
    address?: string;
    name: string;
    symbol: string;
    decimals: number;
    ipfsHash: string;
    swarmHash: string;
}
export declare type DoneCallback = (err?: Error) => void;
export declare class CompilationError extends Error {
    errorsCount: number;
    typeName: string;
    constructor(errorsCount: number);
}
//# sourceMappingURL=types.d.ts.map