"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPMResolver = void 0;
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const resolver_1 = require("./resolver");
class NPMResolver extends resolver_1.Resolver {
    constructor(packagePath) {
        super();
        this._packagePath = packagePath;
    }
    resolveIfExists(importPath) {
        if (!importPath.startsWith('/')) {
            let packageName;
            let packageScopeIfExists;
            let other;
            if (_.startsWith(importPath, '@')) {
                [packageScopeIfExists, packageName, ...other] = importPath.split('/');
            }
            else {
                [packageName, ...other] = importPath.split('/');
            }
            const pathWithinPackage = path.join(...other);
            let currentPath = this._packagePath;
            const ROOT_PATH = '/';
            while (currentPath !== ROOT_PATH) {
                const packagePath = packageScopeIfExists === undefined ? packageName : path.join(packageScopeIfExists, packageName);
                const lookupPath = path.join(currentPath, 'node_modules', packagePath, pathWithinPackage);
                if (fs.existsSync(lookupPath) && fs.lstatSync(lookupPath).isFile()) {
                    const fileContent = fs.readFileSync(lookupPath).toString('ascii');
                    return { source: fileContent, path: importPath, absolutePath: lookupPath };
                }
                currentPath = path.dirname(currentPath);
            }
        }
        return undefined;
    }
}
exports.NPMResolver = NPMResolver;
//# sourceMappingURL=npm_resolver.js.map