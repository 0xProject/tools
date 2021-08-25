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
const _ = require("lodash");
const process_1 = require("process");
const promisify_child_process_1 = require("promisify-child-process");
const semver = require("semver");
const semverSort = require("semver-sort");
const constants_1 = require("./constants");
const changelog_utils_1 = require("./utils/changelog_utils");
const npm_utils_1 = require("./utils/npm_utils");
const utils_1 = require("./utils/utils");
function prepublishChecksAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        const shouldIncludePrivate = false;
        const updatedPublicPackages = yield utils_1.utils.getPackagesToPublishAsync(shouldIncludePrivate);
        yield checkCurrentVersionMatchesLatestPublishedNPMPackageAsync(updatedPublicPackages);
        yield checkChangelogFormatAsync(updatedPublicPackages);
        yield checkGitTagsForNextVersionAndDeleteIfExistAsync(updatedPublicPackages);
        yield checkPublishRequiredSetupAsync(updatedPublicPackages);
    });
}
function checkGitTagsForNextVersionAndDeleteIfExistAsync(updatedPublicPackages) {
    return __awaiter(this, void 0, void 0, function* () {
        const packageNames = _.map(updatedPublicPackages, pkg => pkg.packageJson.name);
        const localGitTags = yield utils_1.utils.getLocalGitTagsAsync();
        const localTagVersionsByPackageName = yield utils_1.utils.getGitTagsByPackageNameAsync(packageNames, localGitTags);
        const remoteGitTags = yield utils_1.utils.getRemoteGitTagsAsync();
        const remoteTagVersionsByPackageName = yield utils_1.utils.getGitTagsByPackageNameAsync(packageNames, remoteGitTags);
        for (const pkg of updatedPublicPackages) {
            const currentVersion = pkg.packageJson.version;
            const packageName = pkg.packageJson.name;
            const packageLocation = pkg.location;
            const nextVersion = yield utils_1.utils.getNextPackageVersionAsync(currentVersion, packageName, packageLocation);
            const remoteTagVersions = remoteTagVersionsByPackageName[packageName];
            if (_.includes(remoteTagVersions, nextVersion)) {
                const tagName = `:refs/tags/${packageName}@${nextVersion}`;
                yield utils_1.utils.removeRemoteTagAsync(tagName);
            }
            const localTagVersions = localTagVersionsByPackageName[packageName];
            if (_.includes(localTagVersions, nextVersion)) {
                const tagName = `${packageName}@${nextVersion}`;
                yield utils_1.utils.removeLocalTagAsync(tagName);
            }
        }
    });
}
function checkCurrentVersionMatchesLatestPublishedNPMPackageAsync(updatedPublicPackages) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.utils.log('Check package versions against npm registry...');
        const versionMismatches = [];
        for (const pkg of updatedPublicPackages) {
            const packageName = pkg.packageJson.name;
            const packageVersion = pkg.packageJson.version;
            const packageRegistryJsonIfExists = yield npm_utils_1.npmUtils.getPackageRegistryJsonIfExistsAsync(packageName);
            if (packageRegistryJsonIfExists === undefined) {
                continue; // noop for packages not yet published to NPM
            }
            const allVersionsIncludingUnpublished = npm_utils_1.npmUtils.getPreviouslyPublishedVersions(packageRegistryJsonIfExists);
            const sortedVersions = semverSort.desc(allVersionsIncludingUnpublished);
            const latestNPMVersion = sortedVersions[0];
            if (packageVersion !== latestNPMVersion) {
                versionMismatches.push({
                    packageJsonVersion: packageVersion,
                    npmVersion: latestNPMVersion,
                    packageName,
                });
            }
        }
        if (!_.isEmpty(versionMismatches)) {
            utils_1.utils.log(`Found version mismatches between package.json and NPM published versions (might be unpublished).`);
            _.each(versionMismatches, versionMismatch => {
                utils_1.utils.log(`${versionMismatch.packageName}: ${versionMismatch.packageJsonVersion} package.json, ${versionMismatch.npmVersion} on NPM`);
            });
            throw new Error(`Please fix the above package.json/NPM inconsistencies.`);
        }
    });
}
function checkChangelogFormatAsync(updatedPublicPackages) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.utils.log('Check CHANGELOGs for inconsistencies...');
        const changeLogInconsistencies = [];
        for (const pkg of updatedPublicPackages) {
            const packageName = pkg.packageJson.name;
            const changelog = changelog_utils_1.changelogUtils.getChangelogOrCreateIfMissing(packageName, pkg.location);
            const currentVersion = pkg.packageJson.version;
            if (!_.isEmpty(changelog)) {
                const lastEntry = changelog[0];
                const doesLastEntryHaveTimestamp = lastEntry.timestamp !== undefined;
                if (semver.lt(lastEntry.version, currentVersion)) {
                    changeLogInconsistencies.push({
                        packageJsonVersion: currentVersion,
                        changelogVersion: lastEntry.version,
                        packageName,
                    });
                }
                else if (semver.gt(lastEntry.version, currentVersion) && doesLastEntryHaveTimestamp) {
                    // Remove incorrectly added timestamp
                    delete changelog[0].timestamp;
                    // Save updated CHANGELOG.json
                    yield changelog_utils_1.changelogUtils.writeChangelogJsonFileAsync(pkg.location, changelog);
                    utils_1.utils.log(`${packageName}: Removed timestamp from latest CHANGELOG.json entry.`);
                }
            }
        }
        if (!_.isEmpty(changeLogInconsistencies)) {
            utils_1.utils.log(`CHANGELOG versions cannot below package.json versions:`);
            _.each(changeLogInconsistencies, inconsistency => {
                utils_1.utils.log(`${inconsistency.packageName}: ${inconsistency.packageJsonVersion} package.json, ${inconsistency.changelogVersion} CHANGELOG.json`);
            });
            throw new Error('Fix the above inconsistencies to continue.');
        }
    });
}
function checkPublishRequiredSetupAsync(updatedPublicPackages) {
    return __awaiter(this, void 0, void 0, function* () {
        // If no automation token is present in the env vars,
        // check to see if logged into npm before publishing
        if (!process_1.env.NPM_TOKEN) {
            try {
                utils_1.utils.log('Checking that the user is logged in on npm...');
                yield promisify_child_process_1.exec(`npm whoami`, { env: process.env });
            }
            catch (err) {
                throw new Error('You must be logged into npm in the commandline to publish. Run `npm login` and try again.');
            }
            // check to see that all required write permissions exist
            utils_1.utils.log(`Checking that all necessary npm write permissions exist...`);
            const pkgPermissionsResult = yield promisify_child_process_1.exec(`npm access ls-packages`);
            const pkgPermissions = JSON.parse(pkgPermissionsResult.stdout);
            const writePermissions = Object.keys(pkgPermissions).filter(pkgName => {
                return pkgPermissions[pkgName] === 'read-write';
            });
            const unwriteablePkgs = [];
            for (const pkg of updatedPublicPackages) {
                const isPackagePublished = (yield npm_utils_1.npmUtils.getPackageRegistryJsonIfExistsAsync(pkg.packageJson.name)) !== undefined;
                const isPackageWritePermissionsGranted = writePermissions.includes(pkg.packageJson.name);
                if (isPackagePublished && !isPackageWritePermissionsGranted) {
                    unwriteablePkgs.push(pkg);
                }
            }
            if (unwriteablePkgs.length > 0) {
                utils_1.utils.log(`Missing write permissions for the following packages:`);
                unwriteablePkgs.forEach(pkg => {
                    utils_1.utils.log(pkg.packageJson.name);
                });
                throw new Error(`Obtain necessary write permissions to continue.`);
            }
        }
        // Check to see if Git personal token setup
        if (constants_1.constants.githubToken === undefined) {
            throw new Error('You must have a Github personal access token set to an envVar named `GITHUB_TOKEN`. Add it then try again.');
        }
        // Check to see if discord URL is set up
        if (constants_1.constants.discordAlertWebhookUrl === undefined) {
            utils_1.utils.warn('No discord webhook URL set at envVar named `DISCORD_GITHUB_RELEASE_WEBHOOK_URL`.');
        }
        // Check that `aws` commandline tool is installed
        try {
            utils_1.utils.log('Checking that aws CLI tool is installed...');
            yield promisify_child_process_1.exec(`aws help`);
        }
        catch (err) {
            throw new Error('You must have `awscli` commandline tool installed. Install it and try again.');
        }
        // Check that `aws` credentials are setup
        try {
            utils_1.utils.log('Checking that aws credentials are configured...');
            yield promisify_child_process_1.exec(`aws sts get-caller-identity`);
        }
        catch (err) {
            throw new Error('You must setup your AWS credentials by running `aws configure`. Do this and try again.');
        }
        utils_1.utils.log('Checking that git branch is up to date with upstream...');
        yield promisify_child_process_1.exec('git fetch');
        const res = yield promisify_child_process_1.exec('git status -bs'); // s - short format, b - branch info
        /**
         * Possible outcomes
         * ## branch_name...origin/branch_name [behind n]
         * ## branch_name...origin/branch_name [ahead n]
         * ## branch_name...origin/branch_name
         */
        const gitShortStatusHeader = res.stdout.split('\n')[0];
        if (gitShortStatusHeader.includes('behind')) {
            throw new Error('Your branch is behind upstream. Please pull before publishing.');
        }
        else if (gitShortStatusHeader.includes('ahead')) {
            throw new Error('Your branch is ahead of upstream. Please push before publishing.');
        }
    });
}
prepublishChecksAsync().catch(err => {
    utils_1.utils.log(err);
    process.exit(1);
});
//# sourceMappingURL=prepublish_checks.js.map