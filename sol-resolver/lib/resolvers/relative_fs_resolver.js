"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelativeFSResolver = void 0;
const fs = require("fs");
const path = require("path");
const resolver_1 = require("./resolver");
class RelativeFSResolver extends resolver_1.Resolver {
    constructor(contractsDir) {
        super();
        this._contractsDir = contractsDir;
    }
    // tslint:disable-next-line:prefer-function-over-method
    resolveIfExists(importPath) {
        const filePath = path.resolve(path.join(this._contractsDir, importPath));
        if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
            const fileContent = fs.readFileSync(filePath).toString('ascii');
            return { source: fileContent, path: importPath, absolutePath: filePath };
        }
        return undefined;
    }
}
exports.RelativeFSResolver = RelativeFSResolver;
//# sourceMappingURL=relative_fs_resolver.js.map