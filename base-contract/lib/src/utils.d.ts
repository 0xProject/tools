import { ContractArtifact, DataItem, MethodAbi } from 'ethereum-types';
export declare function formatABIDataItem(abi: DataItem, value: any, formatter: (type: string, value: any) => any): any;
/**
 * Takes a MethodAbi and returns a function signature for ABI encoding/decoding
 * @return a function signature as a string, e.g. 'functionName(uint256, bytes[])'
 */
export declare function methodAbiToFunctionSignature(methodAbi: MethodAbi): string;
/**
 * Replaces unliked library references in the bytecode of a contract artifact
 * with real addresses and returns the bytecode.
 */
export declare function linkLibrariesInBytecode(artifact: ContractArtifact, libraryAddresses: {
    [libraryName: string]: string;
}): string;
//# sourceMappingURL=utils.d.ts.map