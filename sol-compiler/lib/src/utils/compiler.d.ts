/// <reference types="node" />
import { ContractSource, Resolver } from '@0x/sol-resolver';
import { ContractArtifact } from 'ethereum-types';
import * as solc from 'solc';
import { BinaryPaths } from './types';
/**
 * Gets contract data or returns if an artifact does not exist.
 * @param artifactsDir Path to the artifacts directory.
 * @param contractName Name of contract.
 * @return Contract data or undefined.
 */
export declare function getContractArtifactIfExistsAsync(artifactsDir: string, contractName: string): Promise<ContractArtifact | void>;
/**
 * Creates a directory if it does not already exist.
 * @param artifactsDir Path to the directory.
 */
export declare function createDirIfDoesNotExistAsync(dirPath: string): Promise<void>;
/**
 * Searches Solidity source code for compiler version range.
 * @param  source Source code of contract.
 * @return Solc compiler version range.
 */
export declare function parseSolidityVersionRange(source: string): string;
/**
 * Normalizes the path found in the error message. If it cannot be normalized
 * the original error message is returned.
 * Example: converts 'base/Token.sol:6:46: Warning: Unused local variable'
 *          to 'Token.sol:6:46: Warning: Unused local variable'
 * This is used to prevent logging the same error multiple times.
 * @param  errMsg An error message from the compiled output.
 * @return The error message with directories truncated from the contract path.
 */
export declare function getNormalizedErrMsg(errMsg: string): string;
/**
 * Parses the contract source code and extracts the dendencies
 * @param  source Contract source code
 * @return List of dependendencies
 */
export declare function parseDependencies(contractSource: ContractSource): string[];
/**
 * Fetches the list of available solidity compilers
 * @param isOfflineMode Offline mode flag
 */
export declare function getSolcJSReleasesAsync(isOfflineMode: boolean): Promise<BinaryPaths>;
/**
 * Compiles the contracts and prints errors/warnings
 * @param solcInstance Instance of a solc compiler
 * @param standardInput Solidity standard JSON input
 * @param isOfflineMode Offline mode flag
 */
export declare function compileSolcJSAsync(solcInstance: solc.SolcInstance, standardInput: solc.StandardInput): Promise<solc.StandardOutput>;
/**
 * Compiles the contracts and prints errors/warnings
 * @param solidityVersion Solidity version
 * @param standardInput Solidity standard JSON input
 */
export declare function compileDockerAsync(solidityVersion: string, standardInput: solc.StandardInput): Promise<solc.StandardOutput>;
/**
 * Makes the path relative removing all system-dependent data. Converts absolute paths to a format suitable for artifacts.
 * @param absolutePathToSmth Absolute path to contract or source
 * @param contractsDir Current package contracts directory location
 * @param dependencyNameToPath Mapping of dependency name to package path
 */
export declare function makeContractPathsRelative(absolutePathToSmth: {
    [absoluteContractPath: string]: any;
}, contractsDir: string, dependencyNameToPath: {
    [dependencyName: string]: string;
}): {
    [contractPath: string]: any;
};
/**
 * Separates errors from warnings, formats the messages and prints them. Throws if there is any compilation error (not warning).
 * @param solcErrors The errors field of standard JSON output that contains errors and warnings.
 */
export declare function printCompilationErrorsAndWarnings(solcErrors: solc.SolcError[]): void;
/**
 * Gets the source tree hash for a file and its dependencies.
 * @param fileName Name of contract file.
 */
export declare function getSourceTreeHash(resolver: Resolver, importPath: string): Buffer;
/**
 * Mapping of absolute contract path to compilation ID and source code.
 */
export interface CompiledSources {
    [sourcePath: string]: {
        id: number;
        content: string;
        ast?: object;
    };
}
/**
 * Contract sources by import path.
 */
export interface CompiledImports {
    [importPath: string]: {
        id: number;
        content: string;
        ast?: object;
    };
}
/**
 * Recursively parses imports from sources starting from `contractPath`.
 * @return Sources required by imports.
 */
export declare function getSourcesWithDependencies(contractPath: string, sourcesByAbsolutePath: CompiledSources, importRemappings: {
    [prefix: string]: string;
}): CompiledImports;
/**
 * Calls `getSolcJSAsync()` for every solc version passed in.
 * @param versions Arrays of solc versions.
 */
export declare function preFetchCSolcJSBinariesAsync(solcVersions: string[]): Promise<void>;
/**
 * Gets the solidity compiler instance. If the compiler is already cached - gets it from FS,
 * otherwise - fetches it and caches it.
 * @param solidityVersion The solidity version. e.g. 0.5.0
 * @param isOfflineMode Offline mode flag
 */
export declare function getSolcJSAsync(solidityVersion: string, isOfflineMode: boolean): Promise<solc.SolcInstance>;
/**
 * Gets the solidity compiler instance from a module path.
 * @param path The path to the solc module.
 */
export declare function getSolcJSFromPath(modulePath: string): solc.SolcInstance;
/**
 * Gets the solidity compiler version from a module path.
 * @param path The path to the solc module.
 */
export declare function getSolcJSVersionFromPath(modulePath: string): string;
/**
 * Solidity compiler emits the bytecode without a 0x prefix for a hex. This function fixes it if bytecode is present.
 * @param compiledContract The standard JSON output section for a contract. Geth modified in place.
 */
export declare function addHexPrefixToContractBytecode(compiledContract: solc.StandardContractOutput): void;
/**
 * Takes the list of resolved contract sources from `SpyResolver` and produces a mapping from dependency name
 * to package path used in `remappings` later, as well as in generating the "relative" source paths saved to the artifact files.
 * @param contractSources The list of resolved contract sources
 */
export declare function getDependencyNameToPackagePath(contractSources: ContractSource[]): {
    [dependencyName: string]: string;
};
/**
 * Extract the solidity version (e.g., '0.5.9') from a solc version (e.g., `0.5.9+commit.34d3134f`).
 */
export declare function getSolidityVersionFromSolcVersion(solcVersion: string): string;
/**
 * Strips any extra characters before and after the version + commit hash of a solc version string.
 */
export declare function normalizeSolcVersion(fullSolcVersion: string): string;
/**
 * Gets the full version string of a dockerized solc.
 */
export declare function getDockerFullSolcVersionAsync(solidityVersion: string): Promise<string>;
/**
 * Gets the full version string of a JS module solc.
 */
export declare function getJSFullSolcVersionAsync(solidityVersion: string, isOfflineMode?: boolean): Promise<string>;
//# sourceMappingURL=compiler.d.ts.map