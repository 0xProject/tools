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
const yargs = require("yargs");
const github_release_utils_1 = require("./utils/github_release_utils");
const utils_1 = require("./utils/utils");
const args = yargs
    .option('isDryRun', {
    describe: 'Whether we wish to do a dry run, not committing anything to Github',
    type: 'boolean',
    demandOption: true,
})
    .option('packages', {
    describe: 'Space-separated list of packages to generated release notes for. If not supplied, it does all `Lerna updated` packages.',
    type: 'string',
})
    .option('repo', {
    required: true,
    type: 'string',
})
    .example('$0 --isDryRun true --packages "0x.js @0x/web3-wrapper"', 'Full usage example').argv;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const isDryRun = args.isDryRun;
    let packages;
    if (args.packages === undefined) {
        const shouldIncludePrivate = false;
        packages = yield utils_1.utils.getPackagesToPublishAsync(shouldIncludePrivate);
    }
    else {
        const packageNames = args.packages.split(' ');
        packages = yield utils_1.utils.getPackagesByNameAsync(packageNames);
    }
    yield github_release_utils_1.publishReleaseNotesAsync(packages, args.repo, isDryRun);
    process.exit(0);
}))().catch(err => {
    utils_1.utils.log(err);
    process.exit(1);
});
//# sourceMappingURL=publish_release_notes.js.map