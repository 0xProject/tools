"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLResolver = void 0;
const fs = require("fs");
const resolver_1 = require("./resolver");
class URLResolver extends resolver_1.Resolver {
    // tslint:disable-next-line:prefer-function-over-method
    resolveIfExists(importPath) {
        const FILE_URL_PREXIF = 'file://';
        if (importPath.startsWith(FILE_URL_PREXIF)) {
            const filePath = importPath.substr(FILE_URL_PREXIF.length);
            const fileContent = fs.readFileSync(filePath).toString('ascii');
            return { source: fileContent, path: importPath, absolutePath: filePath };
        }
        return undefined;
    }
}
exports.URLResolver = URLResolver;
//# sourceMappingURL=url_resolver.js.map