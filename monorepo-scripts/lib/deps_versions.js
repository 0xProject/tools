#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const glob_1 = require("glob");
const process_1 = require("process");
const utils_1 = require("./utils/utils");
const PACKAGE_JSON_GLOB = process_1.env.PACKAGE_JSON_GLOB || './*/package.json';
const config = utils_1.utils.readJSONFile('./package.json').config; // tslint:disable-line no-unnecessary-type-assertion
const dependenciesWithIgnoredVersions = (config.ignoreDependencyVersions || '').split(' ');
const packagesWithIgnoredVersions = (config.ignoreDependencyVersionsForPackage || '').split(' ');
if (require.main === module) {
    const dependencies = parseDependencies();
    const ignoredMultiples = getDependenciesWithMultipleVersions(dependencies.ignored);
    const multiples = getDependenciesWithMultipleVersions(dependencies.included);
    printVersionsByDependency(multiples);
    utils_1.utils.log(`├── ${chalk_1.default.bold('IGNORED')}`);
    printVersionsByDependency(ignoredMultiples);
    if (Object.keys(multiples).length !== 0) {
        utils_1.utils.log(`Some dependencies have multiple versions. Please fix by trying to find compatible versions. As a last resort, you can add space-separated exceptions to root package.json config.ignoreDependencyVersions`);
        process.exit(1);
    }
}
function getDependencies(_path) {
    const packageJSON = utils_1.utils.readJSONFile(_path);
    const dependencies = Object.assign(Object.assign({}, packageJSON.dependencies), packageJSON.devDependencies);
    return dependencies;
}
function parseDependencies() {
    const files = glob_1.sync(PACKAGE_JSON_GLOB);
    const parsedDependencies = {
        ignored: {},
        included: {},
    };
    files.map(_path => {
        const pathParts = _path.split('/');
        const packageName = pathParts[pathParts.length - 2];
        const packageCategory = packagesWithIgnoredVersions.includes(packageName) ? 'ignored' : 'included';
        const dependencies = getDependencies(_path);
        Object.keys(dependencies).forEach((depName) => {
            const category = dependenciesWithIgnoredVersions.includes(depName) ? 'ignored' : packageCategory;
            if (parsedDependencies[category][depName] === undefined) {
                parsedDependencies[category][depName] = {};
            }
            const version = dependencies[depName];
            parsedDependencies[category][depName][packageName] = version;
        });
    });
    return parsedDependencies;
}
function getDependenciesWithMultipleVersions(versionsByDependency) {
    return Object.keys(versionsByDependency)
        .filter((depName) => hasMultipleVersions(versionsByDependency[depName]))
        .reduce((obj, depName) => {
        obj[depName] = versionsByDependency[depName];
        return obj;
    }, {});
}
function printVersionsByDependency(versionsByDependency) {
    Object.keys(versionsByDependency).forEach((depName) => {
        const versions = versionsByDependency[depName];
        utils_1.utils.log(chalk_1.default.bold(depName));
        Object.keys(versions).forEach((packageName) => {
            utils_1.utils.log(`├── ${packageName} -> ${versions[packageName]}`);
        });
    });
}
function hasMultipleVersions(versions) {
    const uniques = new Set(Object.values(versions));
    return uniques.size > 1;
}
//# sourceMappingURL=deps_versions.js.map