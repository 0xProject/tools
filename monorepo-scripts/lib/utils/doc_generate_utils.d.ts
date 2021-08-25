import { DocGenConfigs } from '../types';
export declare class DocGenerateUtils {
    private readonly _packageName;
    private readonly _packageDir;
    private readonly _omitExports;
    private readonly _packagePath;
    private readonly _exportPathToExportedItems;
    private readonly _monoRepoPkgNameToPath;
    private readonly _packageJson;
    /**
     *  Recursively iterate over the TypeDoc JSON object and find all type names
     */
    private static _getAllTypeNames;
    /**
     * Recursively iterate over the TypeDoc JSON object and find all reference names (i.e types, classNames,
     * objectLiteral names, etc...)
     */
    private static _getAllReferenceNames;
    private static _getExportPathToExportedItems;
    constructor(packageName: string);
    generateAndUploadDocsAsync(docGenConfigs: DocGenConfigs): Promise<void>;
    /**
     *  Look for types that are used by the public interface but are missing from a package's index.ts
     */
    private _lookForMissingReferenceExportsThrowIfExists;
    /**
     * Look for exported types that are not used by the package's public interface
     */
    private _lookForUnusedExportedTypesThrowIfExists;
    /**
     *  For each entry in the TypeDoc JSON, remove it if:
     * - it was not exported in index.ts
     * - the constructor is to be ignored
     * - it begins with an underscore (i.e is private)
     */
    private _pruneTypedocOutput;
    /**
     * Unfortunately TypeDoc children names will only be prefixed with the name of the package _if_ we passed
     * TypeDoc files outside of the packages root path (i.e this package exports another package from our
     * monorepo). In order to enforce that the names are always prefixed with the package's name, we check and add
     * them here when necessary.
     */
    private _standardizeTypedocOutputTopLevelChildNames;
    /**
     * Maps back each top-level TypeDoc JSON object name to the exportPath from which it was generated.
     */
    private _findExportPathGivenTypedocName;
    private _getTypeDocFileIncludesForPackage;
}
//# sourceMappingURL=doc_generate_utils.d.ts.map