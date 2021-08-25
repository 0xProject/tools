"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
const Lint = require("tslint");
const tsutils_1 = require("tsutils");
const ts = require("typescript");
// tslint:disable:no-unnecessary-type-assertion
/**
 * A modified version of the no-magic-numbers rule that allows for magic numbers
 * when instantiating a BigNumber instance.
 * E.g We want to be able to write:
 *     const amount = new BigNumber(5);
 * Original source: https://github.com/palantir/tslint/blob/42b058a6baa688f8be8558b277eb056c3ff79818/src/rules/noMagicNumbersRule.ts
 */
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        const allowedNumbers = this.ruleArguments.length > 0 ? this.ruleArguments : Rule.DEFAULT_ALLOWED;
        return this.applyWithWalker(
        // tslint:disable-next-line:no-inferred-empty-object-type
        new CustomNoMagicNumbersWalker(sourceFile, this.ruleName, new Set(allowedNumbers.map(String))));
    }
}
exports.Rule = Rule;
Rule.ALLOWED_NODES = new Set([
    ts.SyntaxKind.ExportAssignment,
    ts.SyntaxKind.FirstAssignment,
    ts.SyntaxKind.LastAssignment,
    ts.SyntaxKind.PropertyAssignment,
    ts.SyntaxKind.ShorthandPropertyAssignment,
    ts.SyntaxKind.VariableDeclaration,
    ts.SyntaxKind.VariableDeclarationList,
    ts.SyntaxKind.EnumMember,
    ts.SyntaxKind.PropertyDeclaration,
    ts.SyntaxKind.Parameter,
]);
Rule.DEFAULT_ALLOWED = [-1, 0, 1];
// tslint:disable-next-line:max-classes-per-file
class CustomNoMagicNumbersWalker extends Lint.AbstractWalker {
    static _isNegativeNumberLiteral(node) {
        return (tsutils_1.isPrefixUnaryExpression(node) &&
            node.operator === ts.SyntaxKind.MinusToken &&
            node.operand.kind === ts.SyntaxKind.NumericLiteral);
    }
    walk(sourceFile) {
        const cb = (node) => {
            if (node.kind === ts.SyntaxKind.NumericLiteral) {
                return this.checkNumericLiteral(node, node.text);
            }
            if (CustomNoMagicNumbersWalker._isNegativeNumberLiteral(node)) {
                return this.checkNumericLiteral(node, `-${node.operand.text}`);
            }
            return ts.forEachChild(node, cb);
        };
        return ts.forEachChild(sourceFile, cb);
    }
    // tslint:disable:no-non-null-assertion
    // tslint:disable-next-line:underscore-private-and-protected
    checkNumericLiteral(node, num) {
        if (!Rule.ALLOWED_NODES.has(node.parent.kind) && !this.options.has(num)) {
            if (node.parent.kind === ts.SyntaxKind.NewExpression) {
                const className = node.parent.expression.escapedText;
                const BIG_NUMBER_NEW_EXPRESSION = 'BigNumber';
                if (className === BIG_NUMBER_NEW_EXPRESSION) {
                    return; // noop
                }
            }
            this.addFailureAtNode(node, CustomNoMagicNumbersWalker.FAILURE_STRING);
        }
    }
}
CustomNoMagicNumbersWalker.FAILURE_STRING = "'magic numbers' are not allowed";
// tslint:enable:no-unnecessary-type-assertion
//# sourceMappingURL=customNoMagicNumbersRule.js.map