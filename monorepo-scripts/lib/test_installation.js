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
const mkdirp = require("mkdirp");
const path = require("path");
const promisify_child_process_1 = require("promisify-child-process");
const rimraf = require("rimraf");
const util_1 = require("util");
const yargs = require("yargs");
const constants_1 = require("./constants");
const utils_1 = require("./utils/utils");
const ARGV = yargs.option('skip-install', { type: 'array', default: [] }).argv;
const mkdirpAsync = util_1.promisify(mkdirp);
const rimrafAsync = util_1.promisify(rimraf);
const writeFileAsync = util_1.promisify(fs.writeFile);
// returns the index for the given package name.
function findPackageIndex(packages, packageName) {
    return _.findIndex(packages, pkg => pkg.packageJson.name === packageName);
}
function logIfDefined(x) {
    if (x !== undefined) {
        utils_1.utils.log(x);
    }
}
// tslint:disable-next-line:custom-no-magic-numbers
const FIVE_MB = 1024 * 1024 * 5;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const IS_LOCAL_PUBLISH = process.env.IS_LOCAL_PUBLISH === 'true';
    const registry = IS_LOCAL_PUBLISH ? 'http://localhost:4873/' : 'https://registry.npmjs.org/';
    const monorepoRootPath = constants_1.constants.monorepoRootPath;
    // We sort error messages according to package topology so that we can see
    // them in a more intuitive order. E.g. if package A has an error and
    // package B imports it, the tests for both package A and package B will
    // fail. But package B only fails because of an error in package A.
    // Since the error in package A is the root cause, we log it first.
    const packages = utils_1.utils.getTopologicallySortedPackages(monorepoRootPath);
    const installablePackages = _.filter(packages, pkg => {
        return (!pkg.packageJson.private &&
            pkg.packageJson.main !== undefined &&
            pkg.packageJson.main.endsWith('.js') &&
            !ARGV.skipInstall.includes(pkg.packageJson.name));
    });
    const CHUNK_SIZE = 15;
    const chunkedInstallablePackages = _.chunk(installablePackages, CHUNK_SIZE);
    utils_1.utils.log(`Testing all packages in ${chunkedInstallablePackages.length} chunks`);
    for (const installablePackagesChunk of chunkedInstallablePackages) {
        utils_1.utils.log('Testing packages:');
        _.map(installablePackagesChunk, pkg => utils_1.utils.log(`* ${pkg.packageJson.name}`));
        // Run all package tests within that chunk asynchronously and push promises into an array so
        // we can wait for all of them to resolve.
        const promises = [];
        const errors = [];
        for (const installablePackage of installablePackagesChunk) {
            const packagePromise = testInstallPackageAsync(monorepoRootPath, registry, installablePackage).catch(error => {
                errors.push({ packageName: installablePackage.packageJson.name, error });
            });
            promises.push(packagePromise);
        }
        yield Promise.all(promises);
        if (errors.length > 0) {
            const topologicallySortedErrors = _.sortBy(errors, packageErr => findPackageIndex(packages, packageErr.packageName));
            _.forEach(topologicallySortedErrors, packageError => {
                utils_1.utils.log(`ERROR in package ${packageError.packageName}:`);
                logIfDefined(packageError.error.message);
                logIfDefined(packageError.error.stderr);
                logIfDefined(packageError.error.stdout);
                logIfDefined(packageError.error.stack);
            });
            process.exit(1);
        }
    }
    process.exit(0);
}))().catch(err => {
    utils_1.utils.log(`Unexpected error: ${err.message}`);
    process.exit(1);
});
function testInstallPackageAsync(monorepoRootPath, registry, installablePackage) {
    return __awaiter(this, void 0, void 0, function* () {
        const changelogPath = path.join(installablePackage.location, 'CHANGELOG.json');
        const lastChangelogVersion = utils_1.utils.readJSONFile(changelogPath)[0].version;
        const packageName = installablePackage.packageJson.name;
        utils_1.utils.log(`Testing ${packageName}@${lastChangelogVersion}`);
        const packageDirName = path.join(...`${packageName}-test`.split('/'));
        // NOTE(fabio): The `testDirectory` needs to be somewhere **outside** the monorepo root directory.
        // Otherwise, it will have access to the hoisted `node_modules` directory and the TypeScript missing
        // type errors will not be caught.
        const testDirectory = path.join(monorepoRootPath, '..', '.installation-test', packageDirName);
        yield rimrafAsync(testDirectory);
        yield mkdirpAsync(testDirectory);
        yield promisify_child_process_1.exec('yarn init --yes', { cwd: testDirectory });
        const npmrcFilePath = path.join(testDirectory, '.npmrc');
        yield writeFileAsync(npmrcFilePath, `registry=${registry}`);
        utils_1.utils.log(`Installing ${packageName}@${lastChangelogVersion}`);
        yield promisify_child_process_1.exec(`npm install --save ${packageName}@${lastChangelogVersion} --registry=${registry}`, {
            cwd: testDirectory,
            maxBuffer: FIVE_MB,
        });
        const indexFilePath = path.join(testDirectory, 'index.ts');
        yield writeFileAsync(indexFilePath, `import * as Package from '${packageName}';\nconsole.log(Package);\n`);
        const tsConfig = {
            compilerOptions: {
                typeRoots: ['node_modules/@0x/typescript-typings/types', 'node_modules/@types'],
                module: 'commonjs',
                target: 'es5',
                lib: ['es2017', 'dom'],
                declaration: true,
                noImplicitReturns: true,
                pretty: true,
                strict: true,
                resolveJsonModule: true,
            },
            include: ['index.ts'],
        };
        const tsconfigFilePath = path.join(testDirectory, 'tsconfig.json');
        yield writeFileAsync(tsconfigFilePath, JSON.stringify(tsConfig, null, '\t'));
        utils_1.utils.log(`Compiling ${packageName}`);
        const tscBinaryPath = path.join(monorepoRootPath, './node_modules/typescript/bin/tsc');
        yield promisify_child_process_1.exec(tscBinaryPath, { cwd: testDirectory });
        utils_1.utils.log(`Successfully compiled with ${packageName} as a dependency`);
        const transpiledIndexFilePath = path.join(testDirectory, 'index.js');
        utils_1.utils.log(`Running test script with ${packageName} imported`);
        yield promisify_child_process_1.exec(`node ${transpiledIndexFilePath}`, { maxBuffer: FIVE_MB });
        utils_1.utils.log(`Successfully ran test script with ${packageName} imported`);
        yield rimrafAsync(testDirectory);
    });
}
//# sourceMappingURL=test_installation.js.map