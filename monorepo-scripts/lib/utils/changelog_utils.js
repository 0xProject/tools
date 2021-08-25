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
exports.changelogUtils = void 0;
const fs = require("fs");
const _ = require("lodash");
const moment = require("moment");
const path = require("path");
const promisify_child_process_1 = require("promisify-child-process");
const semver = require("semver");
const constants_1 = require("../constants");
const CHANGELOG_MD_HEADER = `
<!--
changelogUtils.file is auto-generated using the monorepo-scripts package. Don't edit directly.
Edit the package's CHANGELOG.json file only.
-->

CHANGELOG
`;
exports.changelogUtils = {
    getChangelogMdTitle(versionChangelog) {
        // Use UTC rather than the local machines time (formatted date time is +0:00)
        const date = moment.utc(`${versionChangelog.timestamp}`, 'X').format('MMMM D, YYYY');
        const title = `\n## v${versionChangelog.version} - _${date}_\n\n`;
        return title;
    },
    getChangelogMdChange(change) {
        let line = `    * ${change.note}`;
        if (change.pr !== undefined) {
            line += ` (#${change.pr})`;
        }
        return line;
    },
    generateChangelogMd(changelog) {
        let changelogMd = CHANGELOG_MD_HEADER;
        _.each(changelog, versionChangelog => {
            const title = exports.changelogUtils.getChangelogMdTitle(versionChangelog);
            changelogMd += title;
            const changelogVersionLines = _.map(versionChangelog.changes, exports.changelogUtils.getChangelogMdChange.bind(exports.changelogUtils));
            changelogMd += `${_.join(changelogVersionLines, '\n')}`;
        });
        return changelogMd;
    },
    shouldAddNewChangelogEntry(packageName, currentVersion, changelog) {
        if (_.isEmpty(changelog)) {
            return true;
        }
        const lastEntry = changelog[0];
        if (semver.lt(lastEntry.version, currentVersion)) {
            throw new Error(`Found CHANGELOG version lower then current package version. ${packageName} current: ${currentVersion}, Changelog: ${lastEntry.version}`);
        }
        const isLastEntryCurrentVersion = lastEntry.version === currentVersion;
        return isLastEntryCurrentVersion;
    },
    getChangelogJSONIfExists(changelogPath) {
        try {
            const changelogJSON = fs.readFileSync(changelogPath, 'utf-8');
            return changelogJSON;
        }
        catch (err) {
            return undefined;
        }
    },
    getChangelogOrCreateIfMissing(packageName, packageLocation) {
        const changelogJSONPath = path.join(packageLocation, 'CHANGELOG.json');
        let changelogJsonIfExists = exports.changelogUtils.getChangelogJSONIfExists(changelogJSONPath);
        if (changelogJsonIfExists === undefined) {
            // If none exists, create new, empty one.
            changelogJsonIfExists = '[]';
            fs.writeFileSync(changelogJSONPath, changelogJsonIfExists);
        }
        let changelog;
        try {
            changelog = JSON.parse(changelogJsonIfExists);
        }
        catch (err) {
            throw new Error(`${packageName}'s CHANGELOG.json contains invalid JSON. Please fix and try again.`);
        }
        return changelog;
    },
    writeChangelogJsonFileAsync(packageLocation, changelog) {
        return __awaiter(this, void 0, void 0, function* () {
            const changelogJSONPath = path.join(packageLocation, 'CHANGELOG.json');
            fs.writeFileSync(changelogJSONPath, JSON.stringify(changelog, null, '\t'));
            yield exports.changelogUtils.prettifyAsync(changelogJSONPath, constants_1.constants.monorepoRootPath);
        });
    },
    writeChangelogMdFileAsync(packageLocation, changelogMdString) {
        return __awaiter(this, void 0, void 0, function* () {
            const changelogMarkdownPath = path.join(packageLocation, 'CHANGELOG.md');
            fs.writeFileSync(changelogMarkdownPath, changelogMdString);
            yield exports.changelogUtils.prettifyAsync(changelogMarkdownPath, constants_1.constants.monorepoRootPath);
        });
    },
    prettifyAsync(filePath, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            yield promisify_child_process_1.exec(`prettier --write ${filePath} --config .prettierrc`, {
                cwd,
            });
        });
    },
};
//# sourceMappingURL=changelog_utils.js.map