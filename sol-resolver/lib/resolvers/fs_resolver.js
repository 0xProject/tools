"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSResolver = void 0;
const fs = require("fs");
const path = require("path");
const resolver_1 = require("./resolver");
class FSResolver extends resolver_1.Resolver {
    // tslint:disable-next-line:prefer-function-over-method
    resolveIfExists(importPath) {
        if (fs.existsSync(importPath) && fs.lstatSync(importPath).isFile()) {
            const fileContent = fs.readFileSync(importPath).toString('ascii');
            const absolutePath = path.resolve(importPath);
            return { source: fileContent, path: importPath, absolutePath };
        }
        return undefined;
    }
}
exports.FSResolver = FSResolver;
//# sourceMappingURL=fs_resolver.js.map