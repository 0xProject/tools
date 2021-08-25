"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
class Resolver {
    resolve(importPath) {
        const contractSourceIfExists = this.resolveIfExists(importPath);
        if (contractSourceIfExists === undefined) {
            throw new Error(`Failed to resolve ${importPath}`);
        }
        return contractSourceIfExists;
    }
}
exports.Resolver = Resolver;
//# sourceMappingURL=resolver.js.map