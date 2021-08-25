import { CompilerOptions, StandardOutput } from 'ethereum-types';
import solc = require('solc');
import { CompilationResult, ContractContentsByPath, ImportPrefixRemappings, SolcWrapper } from './solc_wrapper';
export declare const DEFAULT_COMPILER_SETTINGS: solc.CompilerSettings;
export declare class SolcWrapperV05 extends SolcWrapper {
    protected readonly _solcVersion: string;
    protected readonly _opts: CompilerOptions;
    protected readonly _compilerSettings: solc.CompilerSettings;
    constructor(_solcVersion: string, _opts: CompilerOptions);
    get version(): string;
    get solidityVersion(): string;
    areCompilerSettingsDifferent(settings: any): boolean;
    compileAsync(contractsByPath: ContractContentsByPath, importRemappings: ImportPrefixRemappings): Promise<CompilationResult>;
    protected _compileInputAsync(input: solc.StandardInput): Promise<StandardOutput>;
    protected _normalizeOutput(output: StandardOutput): StandardOutput;
}
//# sourceMappingURL=solc_wrapper_v05.d.ts.map