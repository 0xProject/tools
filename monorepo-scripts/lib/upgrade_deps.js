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
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const process = require("process");
const promisify_child_process_1 = require("promisify-child-process");
const semver = require("semver");
const yargs = require("yargs");
const constants_1 = require("./constants");
const utils_1 = require("./utils/utils");
var Mode;
(function (Mode) {
    Mode["Package"] = "package";
    Mode["Highest"] = "highest";
})(Mode || (Mode = {}));
const INDENT = '    ';
const ARGV = yargs
    .option('highest', {
    alias: 'h',
    describe: 'upgrade to highest version',
    default: false,
})
    .option('pattern', {
    alias: 'p',
    describe: 'only upgrade dependencies matching this pattern',
    type: 'string',
    default: '.*',
}).argv;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const packages = getUpgradeablePackages();
    const depNames = getAllDependenciesToUpgrade(packages, new RegExp(ARGV.pattern));
    utils_1.utils.log(`Upgrading the following dependencies across all packages: \n\t${depNames.join('\n\t')}\n`);
    const deps = yield getPublishedPackageVersionsAsync(depNames);
    for (const pkg of packages) {
        upgradePackageDeps(ARGV.highest ? Mode.Highest : Mode.Package, pkg, deps);
        writePackageManifest(pkg);
    }
}))().catch(err => {
    utils_1.utils.log(err);
    process.exit(1);
});
function getPublishedPackageVersionsAsync(pkgNames) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.utils.log(`Fetching published versions of dependencies...`);
        const results = yield Promise.all(pkgNames.map(n => promisify_child_process_1.exec(`npm show ${n} versions`)));
        const versions = results.map(r => JSON.parse(r.stdout.replace(/'/g, `"`)));
        return _.zipObject(pkgNames, versions);
    });
}
function getAllDependenciesToUpgrade(packages, pattern = /.*/) {
    return _.uniq(_.flatten(packages.map(pkg => Object.keys(Object.assign(Object.assign({}, (pkg.packageJson.dependencies || {})), (pkg.packageJson.devDependencies || {}))).filter(n => n.match(pattern)))));
}
function getUpgradeablePackages() {
    const packages = utils_1.utils.getPackages(constants_1.constants.monorepoRootPath);
    if (process.env.PKG) {
        return packages.filter(pkg => pkg.packageJson.name === process.env.PKG);
    }
    return [
        utils_1.utils.loadPackageInfo(constants_1.constants.monorepoRootPath),
        ...packages,
    ];
}
function upgradePackageDeps(mode, pkg, deps) {
    const upgradeDependenciesMap = (d) => {
        for (const [name, requirement] of Object.entries(d)) {
            if (name in deps) {
                if (semver.validRange(requirement)) {
                    const version = semver.maxSatisfying(deps[name], mode === Mode.Highest ? '*' : requirement);
                    const prefix = (requirement.match(/[~^=]?/) || [])[0] || '';
                    d[name] = `${prefix}${version}`;
                }
            }
        }
    };
    if (pkg.packageJson.dependencies) {
        upgradeDependenciesMap(pkg.packageJson.dependencies);
    }
    if (pkg.packageJson.devDependencies) {
        upgradeDependenciesMap(pkg.packageJson.devDependencies);
    }
}
function writePackageManifest(pkg) {
    const contents = JSON.stringify(pkg.packageJson, null, INDENT);
    fs.writeFileSync(path.join(pkg.location, 'package.json'), `${contents}\n`);
}
//# sourceMappingURL=upgrade_deps.js.map