"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
const Lint = require("tslint");
const ts = require("typescript");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithFunction(sourceFile, walk);
    }
}
exports.Rule = Rule;
Rule.FAILURE_STRING = `Use built-in equivalent`;
function walk(ctx) {
    // Recursively walk the AST starting with root node, `ctx.sourceFile`.
    // Call the function `cb` (defined below) for each child.
    return ts.forEachChild(ctx.sourceFile, cb);
    function cb(node) {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const firstChild = node.getChildAt(0, ctx.sourceFile);
            if (firstChild.kind === ts.SyntaxKind.PropertyAccessExpression &&
                firstChild.getText(ctx.sourceFile) === '_.isNull') {
                return ctx.addFailureAtNode(node, Rule.FAILURE_STRING, getFix(node));
            }
        }
        // Continue recursion into the AST by calling function `cb` for every child of the current node.
        return ts.forEachChild(node, cb);
    }
    function getFix(node) {
        const isNegated = node.parent.kind === ts.SyntaxKind.PrefixUnaryExpression && node.parent.getText(ctx.sourceFile)[0] === '!';
        const args = node.getChildAt(2, ctx.sourceFile).getText(ctx.sourceFile);
        if (isNegated) {
            return new Lint.Replacement(node.parent.getStart(ctx.sourceFile), node.parent.getWidth(ctx.sourceFile), `${args} !== null`);
        }
        else {
            return new Lint.Replacement(node.getStart(ctx.sourceFile), node.getWidth(ctx.sourceFile), `${args} === null`);
        }
    }
}
//# sourceMappingURL=noLodashIsnullRule.js.map