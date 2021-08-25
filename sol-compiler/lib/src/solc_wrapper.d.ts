import { StandardOutput } from 'ethereum-types';
import { StandardInput } from 'solc';
export interface ContractContentsByPath {
    [path: string]: string;
}
export interface ImportPrefixRemappings {
    [prefix: string]: string;
}
export interface CompilationResult {
    input: StandardInput;
    output: StandardOutput;
}
export declare abstract class SolcWrapper {
    /**
     * Get the solc version.
     */
    abstract get version(): string;
    /**
     * Check if the configured compiler settings is different from another.
     */
    abstract areCompilerSettingsDifferent(settings: any): boolean;
    /**
     * Compile contracts, returning standard input and output.
     */
    abstract compileAsync(contractsByPath: ContractContentsByPath, dependencies: ImportPrefixRemappings): Promise<CompilationResult>;
}
//# sourceMappingURL=solc_wrapper.d.ts.map