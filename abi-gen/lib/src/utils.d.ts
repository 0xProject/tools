import { ConstructorAbi, DataItem } from 'ethereum-types';
import { ContractsBackend, ParamKind } from './types';
export declare const utils: {
    solTypeToAssertion(solName: string, solType: string): string;
    solTypeToTsType(paramKind: ParamKind, backend: ContractsBackend, solType: string, components?: DataItem[] | undefined): string;
    solTypeToPyType(dataItem: DataItem): string;
    isUnionType(tsType: string): boolean;
    isObjectType(tsType: string): boolean;
    getPartialNameFromFileName(filename: string): string;
    getNamedContent(filename: string): {
        name: string;
        content: string;
    };
    getEmptyConstructor(): ConstructorAbi;
    makeOutputFileName(name: string): string;
    writeOutputFile(filePath: string, renderedTsCode: string): void;
    isOutputFileUpToDate(outputFile: string, sourceFiles: string[]): boolean;
    /**
     * simply concatenate all of the names of the components, and convert that
     * concatenation into PascalCase to conform to Python convention.
     */
    makePythonTupleName(tuple: DataItem): string;
    /**
     * @returns a string that is a Python code snippet that's intended to be
     * used as the second parameter to a TypedDict() instantiation; value
     * looks like "{ 'python_dict_key': python_type, ... }".
     */
    makePythonTupleClassBody(tupleComponents: DataItem[]): string;
    /**
     * used to generate Python-parseable identifier names for parameters to
     * contract methods.
     */
    toPythonIdentifier(input: string): string;
    /**
     * Python docstrings are used to generate documentation, and that
     * transformation supports annotation of parameters, return types, etc, via
     * re-Structured Text "interpreted text roles".  Per the pydocstyle linter,
     * such annotations should be line-wrapped at 80 columns, with a hanging
     * indent of 4 columns.  This function simply returns an accordingly
     * wrapped and hanging-indented `role` string.
     */
    wrapPythonDocstringRole(docstring: string, indent: number): string;
    extractTuples(parameter: DataItem, tupleBodies: {
        [pythonTupleName: string]: string;
    }, tupleDependencies: Array<[string, string]>): void;
};
//# sourceMappingURL=utils.d.ts.map