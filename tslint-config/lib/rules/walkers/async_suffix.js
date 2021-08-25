"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncSuffixWalker = void 0;
const Lint = require("tslint");
const ts = require("typescript");
class AsyncSuffixWalker extends Lint.RuleWalker {
    visitFunctionDeclaration(node) {
        this._visitFunctionOrMethodDeclaration(node);
        super.visitFunctionDeclaration(node);
    }
    visitMethodDeclaration(node) {
        this._visitFunctionOrMethodDeclaration(node);
        super.visitMethodDeclaration(node);
    }
    _visitFunctionOrMethodDeclaration(node) {
        const nameNode = node.name;
        if (nameNode !== undefined) {
            const name = nameNode.getText();
            if (node.type !== undefined) {
                if (node.type.kind === ts.SyntaxKind.TypeReference) {
                    // tslint:disable-next-line:no-unnecessary-type-assertion
                    const returnTypeName = node.type.typeName.getText();
                    if (returnTypeName === 'Promise' && !name.endsWith('Async')) {
                        const failure = this.createFailure(nameNode.getStart(), nameNode.getWidth(), AsyncSuffixWalker.FAILURE_STRING);
                        this.addFailure(failure);
                    }
                }
            }
        }
    }
}
exports.AsyncSuffixWalker = AsyncSuffixWalker;
AsyncSuffixWalker.FAILURE_STRING = 'async functions/methods must have an Async suffix';
//# sourceMappingURL=async_suffix.js.map