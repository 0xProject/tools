#!/usr/bin/env node
"use strict";
// We need the above pragma since this script will be run as a command-line tool.
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
const utils_1 = require("@0x/utils");
const _ = require("lodash");
require("source-map-support/register");
const yargs = require("yargs");
const compiler_1 = require("./compiler");
const DEFAULT_CONTRACTS_LIST = '*';
const SEPARATOR = ',';
(() => __awaiter(void 0, void 0, void 0, function* () {
    const argv = yargs
        .option('contracts-dir', {
        type: 'string',
        description: 'path of contracts directory to compile',
    })
        .option('artifacts-dir', {
        type: 'string',
        description: 'path to write contracts artifacts to',
    })
        .option('contracts', {
        type: 'string',
        description: 'comma separated list of contracts to compile',
    })
        .option('watch', {
        alias: 'w',
        default: false,
    })
        .help().argv;
    const contracts = argv.contracts === undefined
        ? undefined
        : argv.contracts === DEFAULT_CONTRACTS_LIST
            ? DEFAULT_CONTRACTS_LIST
            : argv.contracts.split(SEPARATOR);
    const opts = _.omitBy({
        contractsDir: argv.contractsDir,
        artifactsDir: argv.artifactsDir,
        contracts,
        isOfflineMode: process.env.SOLC_OFFLINE ? true : undefined,
    }, v => v === undefined);
    const compiler = new compiler_1.Compiler(yield compiler_1.Compiler.getCompilerOptionsAsync(opts));
    if (argv.watch) {
        yield compiler.watchAsync();
    }
    else {
        yield compiler.compileAsync();
    }
}))().catch(err => {
    utils_1.logUtils.log(err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map