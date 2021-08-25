import 'isomorphic-fetch';
import { PackageRegistryJson } from '../types';
export declare const npmUtils: {
    getPackageRegistryJsonIfExistsAsync(packageName: string): Promise<PackageRegistryJson | undefined>;
    getPreviouslyPublishedVersions(packageRegistryJson: PackageRegistryJson): string[];
};
//# sourceMappingURL=npm_utils.d.ts.map