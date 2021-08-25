"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpyResolver = void 0;
const resolver_1 = require("./resolver");
/**
 * This resolver is a passthrough proxy to any resolver that records all the resolved contracts sources.
 * You can access them later using the `resolvedContractSources` public field.
 */
class SpyResolver extends resolver_1.Resolver {
    constructor(resolver) {
        super();
        this.resolvedContractSources = [];
        this._resolver = resolver;
    }
    resolveIfExists(importPath) {
        const contractSourceIfExists = this._resolver.resolveIfExists(importPath);
        if (contractSourceIfExists !== undefined) {
            this.resolvedContractSources.push(contractSourceIfExists);
        }
        return contractSourceIfExists;
    }
}
exports.SpyResolver = SpyResolver;
//# sourceMappingURL=spy_resolver.js.map