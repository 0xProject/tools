#!/usr/bin/env node

import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import * as process from 'process';
import { exec as execAsync } from 'promisify-child-process';
import semver = require('semver');
import * as yargs from 'yargs';

import { constants } from './constants';
import { Package } from './types';
import { utils } from './utils/utils';

enum Mode {
    Package = 'package',
    Highest = 'highest',
}

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

(async () => {
    const packages = getUpgradeablePackages();
    const depNames = getAllDependenciesToUpgrade(packages, new RegExp(ARGV.pattern));
    utils.log(`Upgrading the following dependencies across all packages: \n\t${depNames.join('\n\t')}\n`);
    const deps = await getPublishedPackageVersionsAsync(depNames);
    for (const pkg of packages) {
        upgradePackageDeps(ARGV.highest ? Mode.Highest : Mode.Package, pkg, deps);
        writePackageManifest(pkg);
    }
})().catch(err => {
    utils.log(err);
    process.exit(1);
});

async function getPublishedPackageVersionsAsync(pkgNames: string[]): Promise<{ [name: string]: string[] }> {
    utils.log(`Fetching published versions of dependencies...`);
    const results = await Promise.all(pkgNames.map(n => execAsync(`npm show ${n} versions`)));
    const versions = results.map(r => JSON.parse((r.stdout as string).replace(/'/g, `"`)));
    return _.zipObject(pkgNames, versions);
}

function getAllDependenciesToUpgrade(packages: Package[], pattern: RegExp = /.*/): string[] {
    return _.uniq(
        _.flatten(
            packages.map(pkg =>
                Object.keys({
                    ...(pkg.packageJson.dependencies || {}),
                    ...(pkg.packageJson.devDependencies || {}),
                }).filter(n => n.match(pattern)),
            ),
        ),
    );
}

function getUpgradeablePackages(): Package[] {
    const packages = utils.getPackages(constants.monorepoRootPath);
    if (process.env.PKG) {
        return packages.filter(pkg => pkg.packageJson.name === process.env.PKG);
    }
    return [
        utils.loadPackageInfo(constants.monorepoRootPath), // Include root package
        ...packages,
    ];
}

function upgradePackageDeps(mode: Mode, pkg: Package, deps: { [name: string]: string[] }): void {
    const upgradeDependenciesMap = (d: { [name: string]: string }) => {
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

function writePackageManifest(pkg: Package): void {
    const contents = JSON.stringify(pkg.packageJson, null, INDENT);
    fs.writeFileSync(path.join(pkg.location, 'package.json'), `${contents}\n`);
}
