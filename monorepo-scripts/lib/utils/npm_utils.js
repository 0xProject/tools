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
exports.npmUtils = void 0;
require("isomorphic-fetch");
const _ = require("lodash");
const configs_1 = require("./configs");
const SUCCESS_STATUS = 200;
const NOT_FOUND_STATUS = 404;
exports.npmUtils = {
    getPackageRegistryJsonIfExistsAsync(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${configs_1.configs.NPM_REGISTRY_URL}/${packageName}`;
            const response = yield fetch(url);
            if (response.status === NOT_FOUND_STATUS) {
                return undefined;
            }
            else if (response.status !== SUCCESS_STATUS) {
                throw new Error(`Request to ${url} failed. Check your internet connection and that npm registry is up.`);
            }
            const packageRegistryJson = yield response.json();
            return packageRegistryJson;
        });
    },
    getPreviouslyPublishedVersions(packageRegistryJson) {
        const timeWithOnlyVersions = _.omit(packageRegistryJson.time, ['modified', 'created']);
        const versions = _.keys(timeWithOnlyVersions);
        return versions;
    },
};
//# sourceMappingURL=npm_utils.js.map