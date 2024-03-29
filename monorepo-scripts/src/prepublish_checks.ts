import * as _ from 'lodash';
import { env as ENV } from 'process';
import { exec as execAsync } from 'promisify-child-process';
import semver = require('semver');
import semverSort = require('semver-sort');

import { constants } from './constants';
import { Package } from './types';
import { changelogUtils } from './utils/changelog_utils';
import { npmUtils } from './utils/npm_utils';
import { utils } from './utils/utils';

async function prepublishChecksAsync(): Promise<void> {
    const shouldIncludePrivate = false;
    const updatedPublicPackages = await utils.getPackagesToPublishAsync(shouldIncludePrivate);

    await checkCurrentVersionMatchesLatestPublishedNPMPackageAsync(updatedPublicPackages);
    await checkChangelogFormatAsync(updatedPublicPackages);
    await checkGitTagsForNextVersionAndDeleteIfExistAsync(updatedPublicPackages);
    await checkPublishRequiredSetupAsync(updatedPublicPackages);
}

async function checkGitTagsForNextVersionAndDeleteIfExistAsync(updatedPublicPackages: Package[]): Promise<void> {
    const packageNames = _.map(updatedPublicPackages, pkg => pkg.packageJson.name);
    const localGitTags = await utils.getLocalGitTagsAsync();
    const localTagVersionsByPackageName = await utils.getGitTagsByPackageNameAsync(packageNames, localGitTags);

    const remoteGitTags = await utils.getRemoteGitTagsAsync();
    const remoteTagVersionsByPackageName = await utils.getGitTagsByPackageNameAsync(packageNames, remoteGitTags);

    for (const pkg of updatedPublicPackages) {
        const currentVersion = pkg.packageJson.version;
        const packageName = pkg.packageJson.name;
        const packageLocation = pkg.location;
        const nextVersion = await utils.getNextPackageVersionAsync(currentVersion, packageName, packageLocation);

        const remoteTagVersions = remoteTagVersionsByPackageName[packageName];
        if (_.includes(remoteTagVersions, nextVersion)) {
            const tagName = `:refs/tags/${packageName}@${nextVersion}`;
            await utils.removeRemoteTagAsync(tagName);
        }

        const localTagVersions = localTagVersionsByPackageName[packageName];
        if (_.includes(localTagVersions, nextVersion)) {
            const tagName = `${packageName}@${nextVersion}`;
            await utils.removeLocalTagAsync(tagName);
        }
    }
}

async function checkCurrentVersionMatchesLatestPublishedNPMPackageAsync(
    updatedPublicPackages: Package[],
): Promise<void> {
    utils.log('Check package versions against npm registry...');
    const versionMismatches = [];
    for (const pkg of updatedPublicPackages) {
        const packageName = pkg.packageJson.name;
        const packageVersion = pkg.packageJson.version;
        const packageRegistryJsonIfExists = await npmUtils.getPackageRegistryJsonIfExistsAsync(packageName);
        if (packageRegistryJsonIfExists === undefined) {
            continue; // noop for packages not yet published to NPM
        }
        const allVersionsIncludingUnpublished = npmUtils.getPreviouslyPublishedVersions(packageRegistryJsonIfExists);
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
        utils.log(`Found version mismatches between package.json and NPM published versions (might be unpublished).`);
        _.each(versionMismatches, versionMismatch => {
            utils.log(
                `${versionMismatch.packageName}: ${versionMismatch.packageJsonVersion} package.json, ${versionMismatch.npmVersion} on NPM`,
            );
        });
        throw new Error(`Please fix the above package.json/NPM inconsistencies.`);
    }
}

async function checkChangelogFormatAsync(updatedPublicPackages: Package[]): Promise<void> {
    utils.log('Check CHANGELOGs for inconsistencies...');
    const changeLogInconsistencies = [];
    for (const pkg of updatedPublicPackages) {
        const packageName = pkg.packageJson.name;
        const changelog = changelogUtils.getChangelogOrCreateIfMissing(packageName, pkg.location);

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
            } else if (semver.gt(lastEntry.version, currentVersion) && doesLastEntryHaveTimestamp) {
                // Remove incorrectly added timestamp
                delete changelog[0].timestamp;
                // Save updated CHANGELOG.json
                await changelogUtils.writeChangelogJsonFileAsync(pkg.location, changelog);
                utils.log(`${packageName}: Removed timestamp from latest CHANGELOG.json entry.`);
            }
        }
    }
    if (!_.isEmpty(changeLogInconsistencies)) {
        utils.log(`CHANGELOG versions cannot below package.json versions:`);
        _.each(changeLogInconsistencies, inconsistency => {
            utils.log(
                `${inconsistency.packageName}: ${inconsistency.packageJsonVersion} package.json, ${inconsistency.changelogVersion} CHANGELOG.json`,
            );
        });
        throw new Error('Fix the above inconsistencies to continue.');
    }
}

async function checkPublishRequiredSetupAsync(updatedPublicPackages: Package[]): Promise<void> {
    // If no automation token is present in the env vars,
    // check to see if logged into npm before publishing
    if (!ENV.NPM_TOKEN) {
        try {
            utils.log('Checking that the user is logged in on npm...');
            await execAsync(`npm whoami`, { env: process.env });
        } catch (err) {
            throw new Error(
                'You must be logged into npm in the commandline to publish. Run `npm login` and try again.',
            );
        }
        // check to see that all required write permissions exist
        utils.log(`Checking that all necessary npm write permissions exist...`);
        const pkgPermissionsResult = await execAsync(`npm access ls-packages`);
        const pkgPermissions = JSON.parse(pkgPermissionsResult.stdout);
        const writePermissions = Object.keys(pkgPermissions).filter(pkgName => {
            return pkgPermissions[pkgName] === 'read-write';
        });
        const unwriteablePkgs = [];
        for (const pkg of updatedPublicPackages) {
            const isPackagePublished =
                (await npmUtils.getPackageRegistryJsonIfExistsAsync(pkg.packageJson.name)) !== undefined;
            const isPackageWritePermissionsGranted = writePermissions.includes(pkg.packageJson.name);
            if (isPackagePublished && !isPackageWritePermissionsGranted) {
                unwriteablePkgs.push(pkg);
            }
        }
        if (unwriteablePkgs.length > 0) {
            utils.log(`Missing write permissions for the following packages:`);
            unwriteablePkgs.forEach(pkg => {
                utils.log(pkg.packageJson.name);
            });
            throw new Error(`Obtain necessary write permissions to continue.`);
        }
    }

    // Check to see if Git personal token setup
    if (constants.githubToken === undefined) {
        throw new Error(
            'You must have a Github personal access token set to an envVar named `GITHUB_TOKEN`. Add it then try again.',
        );
    }

    // Check to see if discord URL is set up
    if (constants.discordAlertWebhookUrl === undefined) {
        utils.warn('No discord webhook URL set at envVar named `DISCORD_GITHUB_RELEASE_WEBHOOK_URL`.');
    }

    // Check that `aws` commandline tool is installed
    try {
        utils.log('Checking that aws CLI tool is installed...');
        await execAsync(`aws help`);
    } catch (err) {
        throw new Error('You must have `awscli` commandline tool installed. Install it and try again.');
    }

    // Check that `aws` credentials are setup
    try {
        utils.log('Checking that aws credentials are configured...');
        await execAsync(`aws sts get-caller-identity`);
    } catch (err) {
        throw new Error('You must setup your AWS credentials by running `aws configure`. Do this and try again.');
    }

    utils.log('Checking that git branch is up to date with upstream...');
    await execAsync('git fetch');
    const res = await execAsync('git status -bs'); // s - short format, b - branch info
    /**
     * Possible outcomes
     * ## branch_name...origin/branch_name [behind n]
     * ## branch_name...origin/branch_name [ahead n]
     * ## branch_name...origin/branch_name
     */
    const gitShortStatusHeader = res.stdout.split('\n')[0];
    if (gitShortStatusHeader.includes('behind')) {
        throw new Error('Your branch is behind upstream. Please pull before publishing.');
    } else if (gitShortStatusHeader.includes('ahead')) {
        throw new Error('Your branch is ahead of upstream. Please push before publishing.');
    }
}

prepublishChecksAsync().catch(err => {
    utils.log(err);
    process.exit(1);
});
