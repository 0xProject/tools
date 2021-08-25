"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
const _ = require("lodash");
const Lint = require("tslint");
const ts = require("typescript");
const VALID_BOOLEAN_PREFIXES = ['is', 'does', 'should', 'was', 'has', 'can', 'did', 'would', 'are'];
// tslint:disable:no-unnecessary-type-assertion
class Rule extends Lint.Rules.TypedRule {
    applyWithProgram(sourceFile, program) {
        return this.applyWithFunction(sourceFile, walk, undefined, program.getTypeChecker());
    }
}
exports.Rule = Rule;
Rule.FAILURE_STRING = `Boolean variable names should begin with: ${VALID_BOOLEAN_PREFIXES.join(', ')}`;
function walk(ctx, tc) {
    traverse(ctx.sourceFile);
    function traverse(node) {
        checkNodeForViolations(ctx, node, tc);
        return ts.forEachChild(node, traverse);
    }
}
function checkNodeForViolations(ctx, node, tc) {
    switch (node.kind) {
        // Handle: const { timestamp } = ...
        case ts.SyntaxKind.BindingElement: {
            const bindingElementNode = node;
            if (bindingElementNode.name.kind === ts.SyntaxKind.Identifier) {
                handleBooleanNaming(bindingElementNode, tc, ctx);
            }
            break;
        }
        // Handle regular assignments: const block = ...
        case ts.SyntaxKind.VariableDeclaration:
            const variableDeclarationNode = node;
            if (variableDeclarationNode.name.kind === ts.SyntaxKind.Identifier) {
                handleBooleanNaming(node, tc, ctx);
            }
            break;
        default:
            _.noop();
    }
}
function handleBooleanNaming(node, tc, ctx) {
    const nodeName = node.name;
    const variableName = nodeName.getText();
    const lowercasedName = _.toLower(variableName);
    const typeNode = tc.getTypeAtLocation(node);
    const typeName = typeNode.intrinsicName;
    if (typeName === 'boolean') {
        const hasProperName = _.find(VALID_BOOLEAN_PREFIXES, prefix => {
            return _.startsWith(lowercasedName, prefix);
        }) !== undefined;
        if (!hasProperName) {
            ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
        }
    }
}
// tslint:enable:no-unnecessary-type-assertion
//# sourceMappingURL=booleanNamingRule.js.map