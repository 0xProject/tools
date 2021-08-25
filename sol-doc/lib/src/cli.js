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
const utils_1 = require("@0x/utils");
const fs = require("fs");
const glob = require("glob");
require("source-map-support/register");
const util_1 = require("util");
const yargs = require("yargs");
const extract_docs_1 = require("./extract_docs");
const gen_md_1 = require("./gen_md");
const transform_docs_1 = require("./transform_docs");
const JSON_TAB_WIDTH = 2;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const argv = yargs
        .option('source', {
        type: 'string',
        array: true,
        description: 'glob paths of source files to compile',
        demandOption: true,
    })
        .option('contract', {
        type: 'string',
        array: true,
        description: 'generate docs for only a contract',
    })
        .option('complete', {
        type: 'boolean',
        description: 'generate docs for all contracts and private methods',
    })
        .option('noFlatten', {
        type: 'boolean',
        description: 'do not merge inherited contracts',
    })
        .option('json', {
        type: 'string',
        description: 'file to save JSON to',
    })
        .option('root', {
        type: 'string',
        array: true,
        description: 'rewrite paths as relative to these directory',
    })
        .option('md', {
        type: 'string',
        description: 'file to save markdown to',
    })
        .option('mdUrlPrefix', {
        type: 'string',
        description: 'prefix for markdown links',
    })
        .help().argv;
    const sources = yield getContractsAsync(argv.source);
    if (!sources.length) {
        throw new Error('no sources found');
    }
    const docs = transform_docs_1.transformDocs(yield extract_docs_1.extractDocsAsync(sources, argv.root), {
        onlyExposed: !argv.complete,
        flatten: !argv.noFlatten,
        contracts: argv.contract,
    });
    if (argv.json) {
        yield writeTextFileAsync(argv.json, JSON.stringify(docs, null, JSON_TAB_WIDTH));
    }
    if (argv.md) {
        yield writeTextFileAsync(argv.md, gen_md_1.generateMarkdownFromDocs(docs, { urlPrefix: argv.mdUrlPrefix }));
    }
}))().catch(err => {
    utils_1.logUtils.warn(err);
    process.exit(1);
});
function getContractsAsync(contractsGlobs) {
    return __awaiter(this, void 0, void 0, function* () {
        let sources = [];
        for (const g of contractsGlobs) {
            sources = [...sources, ...(yield util_1.promisify(glob)(g))];
        }
        return sources;
    });
}
function writeTextFileAsync(file, content) {
    return __awaiter(this, void 0, void 0, function* () {
        return util_1.promisify(fs.writeFile)(file, content, { encoding: 'utf-8' });
    });
}
//# sourceMappingURL=cli.js.map