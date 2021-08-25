import { GitTagsByPackageName, Package, UpdatedPackage } from '../types';
export declare const utils: {
    log(...args: any[]): void;
    warn(...args: any[]): void;
    readJSONFile<T>(path: string): T;
    getTopologicallySortedPackages(rootDir: string): Package[];
    loadPackageInfo(pathToPackageJson: string): Package;
    getPackages(rootDir: string): Package[];
    getPackagesByNameAsync(packageNames: string[]): Promise<Package[]>;
    getPackagesToPublishAsync(shouldIncludePrivate: boolean): Promise<Package[]>;
    getLernaUpdatedPackagesAsync(shouldIncludePrivate: boolean): Promise<UpdatedPackage[]>;
    getNextPackageVersionAsync(currentVersion: string, packageName: string, packageLocation: string): Promise<string>;
    getRemoteGitTagsAsync(): Promise<string[]>;
    getLocalGitTagsAsync(): Promise<string[]>;
    getGitTagsByPackageNameAsync(packageNames: string[], gitTags: string[]): Promise<GitTagsByPackageName>;
    removeLocalTagAsync(tagName: string): Promise<void>;
    removeRemoteTagAsync(tagName: string): Promise<void>;
};
//# sourceMappingURL=utils.d.ts.map