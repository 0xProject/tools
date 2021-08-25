import { PackageJSON } from '@0x/types';
export interface UpdatedPackage {
    name: string;
    version: string;
    private: boolean;
}
export interface Change {
    note: string;
    pr?: number;
}
export declare type Changelog = VersionChangelog[];
export interface VersionChangelog {
    timestamp?: number;
    version: string;
    changes: Change[];
}
export interface PackageToNextVersion {
    [name: string]: string;
}
export interface PackageRegistryJson {
    versions: {
        [version: string]: any;
    };
    time: {
        [version: string]: string;
    };
}
export interface GitTagsByPackageName {
    [packageName: string]: string[];
}
export interface Package {
    location: string;
    packageJson: PackageJSON;
}
export interface DocGenConfigs {
    docJsonVersion: string;
    externalTypeMap: {
        [externalType: string]: boolean;
    };
    ignoredExcessiveTypes: string[];
    typesOnlyLibraries: string[];
}
export interface ExportPathToExportedItems {
    [pkgName: string]: string[];
}
export interface ExportInfo {
    exportPathToExportedItems: ExportPathToExportedItems;
    exportPathOrder: string[];
}
export interface ExportNameToTypedocNames {
    [exportName: string]: string[];
}
//# sourceMappingURL=types.d.ts.map