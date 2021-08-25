"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallthroughResolver = void 0;
const resolver_1 = require("./resolver");
class FallthroughResolver extends resolver_1.Resolver {
    constructor() {
        super(...arguments);
        this._resolvers = [];
    }
    appendResolver(resolver) {
        this._resolvers.push(resolver);
    }
    resolveIfExists(importPath) {
        for (const resolver of this._resolvers) {
            const contractSourceIfExists = resolver.resolveIfExists(importPath);
            if (contractSourceIfExists !== undefined) {
                return contractSourceIfExists;
            }
        }
        return undefined;
    }
}
exports.FallthroughResolver = FallthroughResolver;
//# sourceMappingURL=fallthrough_resolver.js.map