#!/usr/bin/env node
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
const child_process_1 = require("child_process");
const promisify = require("es6-promisify");
const fs = require("fs");
const _ = require("lodash");
const moment = require("moment");
const path = require("path");
const promisify_child_process_1 = require("promisify-child-process");
const prompt = require("prompt");
const semver = require("semver");
const semverSort = require("semver-sort");
const yargs = require("yargs");
const constants_1 = require("./constants");
const changelog_utils_1 = require("./utils/changelog_utils");
const configs_1 = require("./utils/configs");
const discord_1 = require("./utils/discord");
const doc_generate_utils_1 = require("./utils/doc_generate_utils");
const github_release_utils_1 = require("./utils/github_release_utils");
const utils_1 = require("./utils/utils");
const TODAYS_TIMESTAMP = moment().unix();
const ARGV = yargs
    .option('repo', {
    required: true,
    type: 'string',
})
    .option('doc-gen-config', {
    describe: 'doc generation config file',
    type: 'string',
})
    .option('dist-tag', {
    describe: 'dist tag (defaults to latest)',
    type: 'string',
})
    .option('prerelease', {
    describe: 'prerelease ID',
    type: 'string',
})
    .option('yes', { default: false })
    .option('upload-docs', { default: false })
    .option('auto-commit', { default: true }).argv;
function confirmAsync(message) {
    return __awaiter(this, void 0, void 0, function* () {
        prompt.start();
        const result = yield promisify(prompt.get)([message]);
        const didConfirm = result[message] === 'y';
        if (!didConfirm) {
            utils_1.utils.log('Publish process aborted.');
            process.exit(0);
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch public, updated Lerna packages
    const shouldIncludePrivate = true;
    const allPackagesToPublish = yield utils_1.utils.getPackagesToPublishAsync(shouldIncludePrivate);
    if (_.isEmpty(allPackagesToPublish)) {
        utils_1.utils.log('No packages need publishing');
        process.exit(0);
    }
    const packagesWithDocs = getPackagesWithDocs(allPackagesToPublish);
    if (!configs_1.configs.IS_LOCAL_PUBLISH && !ARGV.yes) {
        yield confirmAsync('THIS IS NOT A TEST PUBLISH! You are about to publish one or more packages to npm. Are you sure you want to continue? (y/n)');
    }
    // Update CHANGELOGs
    const updatedPublicPackages = _.filter(allPackagesToPublish, pkg => !pkg.packageJson.private);
    const updatedPublicPackageNames = _.map(updatedPublicPackages, pkg => pkg.packageJson.name);
    utils_1.utils.log(`Will update CHANGELOGs and publish: \n${updatedPublicPackageNames.join('\n')}\n`);
    const packageToNextVersion = yield updateChangeLogsAsync(updatedPublicPackages);
    const updatedPrivatePackages = _.filter(allPackagesToPublish, pkg => pkg.packageJson.private);
    _.each(updatedPrivatePackages, pkg => {
        const currentVersion = pkg.packageJson.version;
        const packageName = pkg.packageJson.name;
        const nextPatchVersionIfValid = tryIncrementPatchVersion(currentVersion);
        if (nextPatchVersionIfValid !== null) {
            packageToNextVersion[packageName] = nextPatchVersionIfValid;
        }
        else {
            throw new Error(`Encountered invalid semver version: ${currentVersion} for package: ${packageName}`);
        }
    });
    // Push changelogs changes and markdown docs to Github
    if (!configs_1.configs.IS_LOCAL_PUBLISH) {
        // Generate markdown docs for packages
        yield generateDocMDAsync(packagesWithDocs);
        if (ARGV.autoCommit) {
            yield pushChangelogsAndMDDocsToGithubAsync();
        }
    }
    // Call LernaPublish
    utils_1.utils.log('Version updates to apply:');
    _.each(packageToNextVersion, (versionChange, packageName) => {
        utils_1.utils.log(`${packageName} -> ${versionChange}`);
    });
    utils_1.utils.log(`Calling 'lerna publish'...`);
    yield lernaPublishAsync(packageToNextVersion);
    const isDryRun = configs_1.configs.IS_LOCAL_PUBLISH;
    if (!isDryRun && !ARGV.prerelease && ARGV.uploadDocs) {
        // Upload markdown docs to S3 bucket
        yield promisify_child_process_1.exec(`npm run upload_md_docs`, { cwd: constants_1.constants.monorepoRootPath });
    }
    const releaseNotes = yield github_release_utils_1.publishReleaseNotesAsync(updatedPublicPackages, ARGV.repo, isDryRun, !!ARGV.prerelease);
    utils_1.utils.log('Published release notes');
    if (!isDryRun && releaseNotes) {
        try {
            yield discord_1.alertDiscordAsync(releaseNotes);
        }
        catch (e) {
            utils_1.utils.log("Publish successful, but couldn't auto-alert discord (", e.message, '), Please alert manually.');
        }
    }
    process.exit(0);
}))().catch(err => {
    utils_1.utils.log(err);
    process.exit(1);
});
function getPackagesWithDocs(allUpdatedPackages) {
    const rootPackageJsonPath = `${constants_1.constants.monorepoRootPath}/package.json`;
    const rootPackageJSON = utils_1.utils.readJSONFile(rootPackageJsonPath);
    const packagesWithDocPagesStringIfExist = _.get(rootPackageJSON, 'config.packagesWithDocPages', undefined);
    if (packagesWithDocPagesStringIfExist === undefined) {
        return []; // None to generate & publish
    }
    const packagesWithDocPages = packagesWithDocPagesStringIfExist.split(' ');
    const updatedPackagesWithDocPages = [];
    _.each(allUpdatedPackages, pkg => {
        const nameWithoutPrefix = pkg.packageJson.name.replace('@0x/', '');
        if (_.includes(packagesWithDocPages, nameWithoutPrefix)) {
            updatedPackagesWithDocPages.push(pkg);
        }
    });
    return updatedPackagesWithDocPages;
}
function generateDocMDAsync(packagesWithDocs) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const pkg of packagesWithDocs) {
            const nameWithoutPrefix = pkg.packageJson.name.replace('@0x/', '');
            const docGenerateAndUploadUtils = new doc_generate_utils_1.DocGenerateUtils(nameWithoutPrefix);
            const docGenConfig = ARGV.config
                ? JSON.parse(fs.readFileSync(ARGV.config, 'utf-8'))
                : constants_1.constants.defaultDocGenConfigs;
            yield docGenerateAndUploadUtils.generateAndUploadDocsAsync(docGenConfig);
        }
    });
}
function pushChangelogsAndMDDocsToGithubAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        yield promisify_child_process_1.exec(`git add . --all`, { cwd: constants_1.constants.monorepoRootPath });
        yield promisify_child_process_1.exec(`git commit -m "Updated CHANGELOGS & MD docs"`, { cwd: constants_1.constants.monorepoRootPath });
        yield promisify_child_process_1.exec(`git push`, { cwd: constants_1.constants.monorepoRootPath });
        utils_1.utils.log(`Pushed CHANGELOG updates & updated MD docs to Github`);
    });
}
function updateChangeLogsAsync(updatedPublicPackages) {
    return __awaiter(this, void 0, void 0, function* () {
        const packageToNextVersion = {};
        for (const pkg of updatedPublicPackages) {
            const packageName = pkg.packageJson.name;
            let changelog = changelog_utils_1.changelogUtils.getChangelogOrCreateIfMissing(packageName, pkg.location);
            const currentVersion = pkg.packageJson.version;
            const shouldAddNewEntry = changelog_utils_1.changelogUtils.shouldAddNewChangelogEntry(pkg.packageJson.name, currentVersion, changelog);
            if (shouldAddNewEntry) {
                // Create a new entry for a patch version with generic changelog entry.
                const nextPatchVersionIfValid = tryIncrementPatchVersion(currentVersion);
                if (nextPatchVersionIfValid === null) {
                    throw new Error(`Encountered invalid semver version: ${currentVersion} for package: ${packageName}`);
                }
                const newChangelogEntry = {
                    timestamp: TODAYS_TIMESTAMP,
                    version: nextPatchVersionIfValid,
                    changes: [
                        {
                            note: constants_1.constants.dependenciesUpdatedMessage,
                        },
                    ],
                };
                changelog = [newChangelogEntry, ...changelog];
                packageToNextVersion[packageName] = nextPatchVersionIfValid;
            }
            else {
                // Update existing entry with timestamp
                const lastEntry = changelog[0];
                if (lastEntry.timestamp === undefined) {
                    lastEntry.timestamp = TODAYS_TIMESTAMP;
                }
                // Check version number is correct.
                const proposedNextVersion = lastEntry.version;
                lastEntry.version = updateVersionNumberIfNeeded(currentVersion, proposedNextVersion);
                changelog[0] = lastEntry;
                packageToNextVersion[packageName] = lastEntry.version;
            }
            // Save updated CHANGELOG.json
            yield changelog_utils_1.changelogUtils.writeChangelogJsonFileAsync(pkg.location, changelog);
            utils_1.utils.log(`${packageName}: Updated CHANGELOG.json`);
            // Generate updated CHANGELOG.md
            const changelogMd = changelog_utils_1.changelogUtils.generateChangelogMd(changelog);
            yield changelog_utils_1.changelogUtils.writeChangelogMdFileAsync(pkg.location, changelogMd);
            utils_1.utils.log(`${packageName}: Updated CHANGELOG.md`);
        }
        return packageToNextVersion;
    });
}
function lernaPublishAsync(packageToNextVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const packageVersionString = _.map(packageToNextVersion, (nextVersion, packageName) => {
                return `${packageName}|${nextVersion}`;
            }).join(',');
            // HACK(fabio): Previously we would pass the packageVersionString directly to `lerna publish` using the
            // `--cdVersions` flag. Since we now need to use `spawn` instead of `exec` when calling Lerna, passing
            // them as a string arg is causing `spawn` to error with `ENAMETOOLONG`. In order to shorten the args
            // passed to `spawn` we now write the new version to a file and pass the filepath to the `cdVersions` arg.
            const cdVersionsFilepath = path.join(__dirname, 'cd_versions.txt');
            fs.writeFileSync(cdVersionsFilepath, packageVersionString);
            const lernaPublishCmd = `node`;
            const lernaPublishArgs = [
                `${constants_1.constants.lernaExecutable}`,
                'publish',
                `--cdVersions=${cdVersionsFilepath}`,
                `--registry=${configs_1.configs.NPM_REGISTRY_URL}`,
                `--yes`,
            ];
            if (configs_1.configs.IS_LOCAL_PUBLISH) {
                lernaPublishArgs.push('--no-git-tag-version');
                lernaPublishArgs.push('--no-push');
            }
            if (process.env.NPM_TOKEN) {
                lernaPublishArgs.push('--no-verify-access');
            }
            let distTag = ARGV.distTag;
            if (ARGV.prerelease && !distTag) {
                // We don't want prereleases getting tagged as 'latest' unless
                // explicitly told to.
                distTag = ARGV.prerelease;
            }
            if (distTag) {
                lernaPublishArgs.push(`--dist-tag=${distTag}`);
            }
            utils_1.utils.log('Lerna is publishing...');
            try {
                const child = child_process_1.spawn(lernaPublishCmd, lernaPublishArgs, {
                    cwd: constants_1.constants.monorepoRootPath,
                });
                child.stdout.on('data', (data) => __awaiter(this, void 0, void 0, function* () {
                    const output = data.toString('utf8');
                    utils_1.utils.log('Lerna publish cmd: ', output);
                    const isOTPPrompt = _.includes(output, 'Enter OTP:');
                    if (isOTPPrompt) {
                        // Prompt for OTP
                        prompt.start();
                        const result = yield promisify(prompt.get)(['OTP']);
                        child.stdin.write(`${result.OTP}\n`);
                    }
                    const didFinishPublishing = _.includes(output, 'Successfully published:');
                    if (didFinishPublishing) {
                        // Remove temporary cdVersions file
                        fs.unlinkSync(cdVersionsFilepath);
                        resolve();
                    }
                }));
                child.stderr.on('data', (data) => {
                    const output = data.toString('utf8');
                    utils_1.utils.log('Lerna publish cmd: ', output);
                });
            }
            catch (err) {
                // Remove temporary cdVersions file
                fs.unlinkSync(cdVersionsFilepath);
                reject(err);
            }
        });
    });
}
function updateVersionNumberIfNeeded(currentVersion, proposedNextVersion) {
    let normalizedProposedNextVersion = proposedNextVersion;
    // Add a prerelease ta the proposed next version if this is a prerelease publush.
    if (ARGV.prerelease) {
        const sv = semver.parse(normalizedProposedNextVersion);
        if (!sv) {
            throw new Error(`Encountered invalid semver: ${normalizedProposedNextVersion}`);
        }
        if (sv.prerelease.length === 0 || sv.prerelease[0] !== ARGV.prerelease) {
            // No prerelease or prerelease ID is different. Replace it with the
            // one we're working with.
            normalizedProposedNextVersion = `${sv.major}.${sv.minor}.${sv.patch}-${ARGV.prerelease}`;
        }
    }
    const updatedVersionIfValid = tryIncrementPatchVersion(currentVersion);
    if (updatedVersionIfValid === null) {
        throw new Error(`Encountered invalid semver: ${currentVersion}`);
    }
    if (normalizedProposedNextVersion === currentVersion) {
        return updatedVersionIfValid;
    }
    const sortedVersions = semverSort.desc([normalizedProposedNextVersion, currentVersion]);
    if (sortedVersions[0] !== normalizedProposedNextVersion) {
        return updatedVersionIfValid;
    }
    return normalizedProposedNextVersion;
}
function tryIncrementPatchVersion(version) {
    return semver.inc(version, ARGV.prerelease ? 'prerelease' : 'patch', false, ARGV.prerelease ? ARGV.prerelease : '');
}
//# sourceMappingURL=publish.js.map