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
exports.utils = void 0;
const batchPackages = require("@lerna/batch-packages");
const fs = require("fs");
const _ = require("lodash");
const promisify_child_process_1 = require("promisify-child-process");
const semver = require("semver");
const constants_1 = require("../constants");
const changelog_utils_1 = require("./changelog_utils");
exports.utils = {
    log(...args) {
        console.log(...args); // tslint:disable-line:no-console
    },
    warn(...args) {
        console.warn(...args); // tslint:disable-line:no-console
    },
    readJSONFile(path) {
        const JSONString = fs.readFileSync(path, 'utf8');
        const parsed = JSON.parse(JSONString);
        return parsed;
    },
    getTopologicallySortedPackages(rootDir) {
        const packages = exports.utils.getPackages(rootDir);
        const batchedPackages = _.flatten(batchPackages(_.map(packages, pkg => pkg.packageJson), false));
        const topsortedPackages = _.map(batchedPackages, (pkg) => _.find(packages, pkg1 => pkg1.packageJson.name === pkg.name));
        return topsortedPackages;
    },
    loadPackageInfo(pathToPackageJson) {
        const packageJson = exports.utils.readJSONFile(`${pathToPackageJson}/package.json`);
        return {
            location: pathToPackageJson,
            packageJson,
        };
    },
    getPackages(rootDir) {
        const rootPackageJson = exports.utils.readJSONFile(`${rootDir}/package.json`);
        if (rootPackageJson.workspaces === undefined) {
            throw new Error(`Did not find 'workspaces' key in root package.json`);
        }
        const packages = [];
        for (const workspace of rootPackageJson.workspaces) {
            // HACK: Remove allowed wildcards from workspace entries.
            // This might be entirely comprehensive.
            const workspacePath = workspace.replace('*', '').replace('**/*', '');
            const subpackageNames = fs.readdirSync(`${rootDir}/${workspacePath}`);
            for (const subpackageName of subpackageNames) {
                if (_.startsWith(subpackageName, '.')) {
                    continue;
                }
                const pathToPackageJson = `${rootDir}/${workspacePath}${subpackageName}`;
                try {
                    packages.push(exports.utils.loadPackageInfo(pathToPackageJson));
                }
                catch (err) {
                    // Couldn't find a 'package.json' for package. Skipping.
                }
            }
        }
        return packages;
    },
    getPackagesByNameAsync(packageNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPackages = exports.utils.getPackages(constants_1.constants.monorepoRootPath);
            const updatedPackages = _.filter(allPackages, pkg => {
                return _.includes(packageNames, pkg.packageJson.name);
            });
            return updatedPackages;
        });
    },
    getPackagesToPublishAsync(shouldIncludePrivate) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedPublicPackages = yield exports.utils.getLernaUpdatedPackagesAsync(shouldIncludePrivate);
            const updatedPackageNames = _.map(updatedPublicPackages, pkg => pkg.name);
            const allPackages = exports.utils.getPackages(constants_1.constants.monorepoRootPath);
            const updatedPackages = _.filter(allPackages, pkg => {
                return _.includes(updatedPackageNames, pkg.packageJson.name);
            });
            return updatedPackages;
        });
    },
    getLernaUpdatedPackagesAsync(shouldIncludePrivate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield promisify_child_process_1.exec(`${constants_1.constants.lernaExecutable} changed --json ${shouldIncludePrivate ? '--all' : ''}`, {
                    cwd: constants_1.constants.monorepoRootPath,
                });
                if (result.stdout === '') {
                    return [];
                }
                const updatedPackages = JSON.parse(result.stdout);
                return updatedPackages;
            }
            catch (err) {
                return [];
            }
        });
    },
    getNextPackageVersionAsync(currentVersion, packageName, packageLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            let nextVersionIfValid;
            const changelog = changelog_utils_1.changelogUtils.getChangelogOrCreateIfMissing(packageName, packageLocation);
            if (_.isEmpty(changelog)) {
                nextVersionIfValid = semver.inc(currentVersion, 'patch');
                return nextVersionIfValid;
            }
            const lastEntry = changelog[0];
            if (semver.gt(currentVersion, lastEntry.version)) {
                throw new Error(`Package.json version cannot be greater then last CHANGELOG entry. Check: ${packageName}`);
            }
            nextVersionIfValid = semver.eq(lastEntry.version, currentVersion)
                ? semver.inc(currentVersion, 'patch')
                : lastEntry.version;
            if (nextVersionIfValid === null) {
                throw new Error(`Encountered invalid semver: ${currentVersion} associated with ${packageName}`);
            }
            return nextVersionIfValid;
        });
    },
    getRemoteGitTagsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const TEN_MEGA_BYTES = 1024 * 1024 * 10; // tslint:disable-line custom-no-magic-numbers
            const result = yield promisify_child_process_1.exec(`git ls-remote --tags`, {
                cwd: constants_1.constants.monorepoRootPath,
                maxBuffer: TEN_MEGA_BYTES,
            });
            const tagsString = result.stdout;
            const tagOutputs = tagsString.split('\n');
            const tags = _.compact(_.map(tagOutputs, tagOutput => {
                const tag = tagOutput.split('refs/tags/')[1];
                // Tags with `^{}` are duplicateous so we ignore them
                // Source: https://stackoverflow.com/questions/15472107/when-listing-git-ls-remote-why-theres-after-the-tag-name
                if (_.endsWith(tag, '^{}')) {
                    return undefined;
                }
                return tag;
            }));
            return tags;
        });
    },
    getLocalGitTagsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield promisify_child_process_1.exec(`git tag`, {
                cwd: constants_1.constants.monorepoRootPath,
            });
            const tagsString = result.stdout;
            const tags = tagsString.split('\n');
            return tags;
        });
    },
    getGitTagsByPackageNameAsync(packageNames, gitTags) {
        return __awaiter(this, void 0, void 0, function* () {
            const tagVersionByPackageName = {};
            _.each(gitTags, tag => {
                const packageNameIfExists = _.find(packageNames, name => {
                    return _.includes(tag, `${name}@`);
                });
                if (packageNameIfExists === undefined) {
                    return; // ignore tags not related to a package we care about.
                }
                const splitTag = tag.split(`${packageNameIfExists}@`);
                if (splitTag.length !== 2) {
                    throw new Error(`Unexpected tag name found: ${tag}`);
                }
                const version = splitTag[1];
                (tagVersionByPackageName[packageNameIfExists] || (tagVersionByPackageName[packageNameIfExists] = [])).push(version);
            });
            return tagVersionByPackageName;
        });
    },
    removeLocalTagAsync(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield promisify_child_process_1.exec(`git tag -d ${tagName}`, {
                    cwd: constants_1.constants.monorepoRootPath,
                });
            }
            catch (err) {
                throw new Error(`Failed to delete local git tag. Got err: ${err}`);
            }
            exports.utils.log(`Removed local tag: ${tagName}`);
        });
    },
    removeRemoteTagAsync(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield promisify_child_process_1.exec(`git push origin ${tagName}`, {
                    cwd: constants_1.constants.monorepoRootPath,
                });
            }
            catch (err) {
                throw new Error(`Failed to delete remote git tag. Got err: ${err}`);
            }
            exports.utils.log(`Removed remote tag: ${tagName}`);
        });
    },
};
//# sourceMappingURL=utils.js.map