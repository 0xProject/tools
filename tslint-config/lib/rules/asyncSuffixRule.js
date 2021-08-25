"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
const Lint = require("tslint");
const async_suffix_1 = require("./walkers/async_suffix");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new async_suffix_1.AsyncSuffixWalker(sourceFile, this.getOptions()));
    }
}
exports.Rule = Rule;
//# sourceMappingURL=asyncSuffixRule.js.map