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
const depcheckAsync = require("depcheck");
const _ = require("lodash");
const constants_1 = require("./constants");
const utils_1 = require("./utils/utils");
// For some reason, `depcheck` hangs on some packages. Add them here.
const IGNORE_PACKAGES = ['@0x/sol-compiler'];
(() => __awaiter(void 0, void 0, void 0, function* () {
    utils_1.utils.log('*** NOTE: Not all deps listed here are actually not required. ***');
    utils_1.utils.log("*** `depcheck` isn't perfect so double check before actually removing any. ***\n");
    const packages = utils_1.utils.getPackages(constants_1.constants.monorepoRootPath);
    for (const pkg of packages) {
        if (_.includes(IGNORE_PACKAGES, pkg.packageJson.name)) {
            continue; // skip
        }
        utils_1.utils.log(`Checking ${pkg.packageJson.name} for unused deps. This might take a while...`);
        const configs = {};
        const { dependencies } = yield depcheckAsync(pkg.location, configs);
        if (!_.isEmpty(dependencies)) {
            _.each(dependencies, dep => {
                utils_1.utils.log(dep);
            });
        }
        utils_1.utils.log('\n');
    }
}))().catch(err => {
    utils_1.utils.log(err);
    process.exit(1);
});
//# sourceMappingURL=find_unused_dependencies.js.map