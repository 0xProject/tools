"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishReleaseNotesAsync = void 0;
const promisify = require("es6-promisify");
const fs_1 = require("fs");
const _ = require("lodash");
const path = require("path");
const promisify_child_process_1 = require("promisify-child-process");
const publishRelease = require("publish-release");
const constants_1 = require("../constants");
const utils_1 = require("./utils");
const publishReleaseAsync = promisify(publishRelease);
// tslint:disable-next-line:completed-docs
function publishReleaseNotesAsync(packagesToPublish, repo, isDryRun, isPrerelease = false) {
    return __awaiter(this, void 0, void 0, function* () {
        // Git push a tag representing this publish (publish-{commit-hash}) (truncate hash)
        const result = yield promisify_child_process_1.exec('git log -n 1 --pretty=format:"%H"', { cwd: constants_1.constants.monorepoRootPath });
        const latestGitCommit = result.stdout;
        const prefixLength = 7;
        const shortenedGitCommit = latestGitCommit.slice(0, prefixLength);
        const tagName = `${repo}@${shortenedGitCommit}`;
        if (!isDryRun) {
            try {
                yield promisify_child_process_1.exec(`git tag ${tagName}`);
            }
            catch (err) {
                if (_.includes(err.message, 'already exists')) {
                    // Noop tag creation since already exists
                }
                else {
                    throw err;
                }
            }
            const { stdout } = yield promisify_child_process_1.exec(`git ls-remote --tags origin refs/tags/${tagName}`);
            if (_.isEmpty(stdout)) {
                yield promisify_child_process_1.exec(`git push origin ${tagName}`);
            }
        }
        const releaseName = `${repo} - ${shortenedGitCommit}`;
        let assets = [];
        let aggregateNotes = '';
        _.each(packagesToPublish, pkg => {
            aggregateNotes += getReleaseNotesForPackage(pkg.location, pkg.packageJson.name);
            const packageAssets = _.get(pkg.packageJson, 'config.postpublish.assets');
            if (packageAssets !== undefined) {
                assets = [...assets, ...packageAssets];
            }
        });
        const finalAssets = adjustAssetPaths(assets);
        const publishReleaseConfigs = {
            repo,
            token: constants_1.constants.githubToken,
            owner: '0xProject',
            tag: tagName,
            name: releaseName,
            notes: aggregateNotes,
            draft: false,
            prerelease: isPrerelease,
            reuseRelease: true,
            reuseDraftOnly: false,
            // TODO: Currently publish-release doesn't let you specify the labels for each asset uploaded
            // Ideally we would like to name the assets after the package they are from
            // Source: https://github.com/remixz/publish-release/issues/39
            assets: finalAssets,
        };
        if (isDryRun) {
            utils_1.utils.log(`Dry run: stopping short of publishing release notes to github`);
            utils_1.utils.log(`Would publish with configs:\n${JSON.stringify(publishReleaseConfigs, null, '\t')}`);
            return;
        }
        utils_1.utils.log('Publishing release notes ', releaseName, '...');
        yield publishReleaseAsync(publishReleaseConfigs);
        return aggregateNotes;
    });
}
exports.publishReleaseNotesAsync = publishReleaseNotesAsync;
// Asset paths should described from the monorepo root. This method prefixes
// the supplied path with the absolute path to the monorepo root.
function adjustAssetPaths(assets) {
    const finalAssets = [];
    _.each(assets, (asset) => {
        const finalAsset = `${constants_1.constants.monorepoRootPath}/${asset}`;
        finalAssets.push(finalAsset);
    });
    return finalAssets;
}
function getReleaseNotesForPackage(packageLocation, packageName) {
    const changelogJSONPath = path.join(packageLocation, 'CHANGELOG.json');
    const changelogJSON = fs_1.readFileSync(changelogJSONPath, 'utf-8');
    const changelogs = JSON.parse(changelogJSON);
    const latestLog = changelogs[0];
    // If only has a `Dependencies updated` changelog, we don't include it in release notes
    if (latestLog.changes.length === 1 && latestLog.changes[0].note === constants_1.constants.dependenciesUpdatedMessage) {
        return '';
    }
    let notes = '';
    _.each(latestLog.changes, change => {
        notes += `* ${change.note}`;
        if (change.pr) {
            notes += ` (#${change.pr})`;
        }
        notes += `\n`;
    });
    if (_.isEmpty(notes)) {
        return ''; // don't include it
    }
    const releaseNotesSection = `### ${packageName}@${latestLog.version}\n${notes}\n\n`;
    return releaseNotesSection;
}
//# sourceMappingURL=github_release_utils.js.map