import { Change, Changelog, VersionChangelog } from '../types';
export declare const changelogUtils: {
    getChangelogMdTitle(versionChangelog: VersionChangelog): string;
    getChangelogMdChange(change: Change): string;
    generateChangelogMd(changelog: Changelog): string;
    shouldAddNewChangelogEntry(packageName: string, currentVersion: string, changelog: Changelog): boolean;
    getChangelogJSONIfExists(changelogPath: string): string | undefined;
    getChangelogOrCreateIfMissing(packageName: string, packageLocation: string): Changelog;
    writeChangelogJsonFileAsync(packageLocation: string, changelog: Changelog): Promise<void>;
    writeChangelogMdFileAsync(packageLocation: string, changelogMdString: string): Promise<void>;
    prettifyAsync(filePath: string, cwd: string): Promise<void>;
};
//# sourceMappingURL=changelog_utils.d.ts.map