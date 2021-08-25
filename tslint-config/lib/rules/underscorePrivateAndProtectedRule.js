"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
const Lint = require("tslint");
const ts = require("typescript");
const UNDERSCORE = '_';
// Copied from: https://github.com/DanielRosenwasser/underscore-privates-tslint-rule
// The version on github is not published on npm
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithFunction(sourceFile, walk);
    }
}
exports.Rule = Rule;
Rule.FAILURE_STRING = 'private and protected members must be prefixed with an underscore';
function walk(ctx) {
    traverse(ctx.sourceFile);
    function traverse(node) {
        checkNodeForViolations(ctx, node);
        return ts.forEachChild(node, traverse);
    }
}
function checkNodeForViolations(ctx, node) {
    if (!isRelevantClassMember(node)) {
        return;
    }
    // The declaration might have a computed property name or a numeric name.
    const name = node.name;
    if (!nameIsIdentifier(name)) {
        return;
    }
    if (!nameStartsWithUnderscore(name.text) && memberIsPrivate(node)) {
        ctx.addFailureAtNode(name, Rule.FAILURE_STRING);
    }
}
function isRelevantClassMember(node) {
    switch (node.kind) {
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.GetAccessor:
        case ts.SyntaxKind.SetAccessor:
            return true;
        default:
            return false;
    }
}
function nameStartsWithUnderscore(text) {
    return text.charCodeAt(0) === UNDERSCORE.charCodeAt(0);
}
function memberIsPrivate(node) {
    return Lint.hasModifier(node.modifiers, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword);
}
function nameIsIdentifier(node) {
    return node.kind === ts.SyntaxKind.Identifier;
}
//# sourceMappingURL=underscorePrivateAndProtectedRule.js.map