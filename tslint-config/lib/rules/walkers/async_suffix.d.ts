import * as Lint from 'tslint';
import * as ts from 'typescript';
export declare class AsyncSuffixWalker extends Lint.RuleWalker {
    static FAILURE_STRING: string;
    visitFunctionDeclaration(node: ts.FunctionDeclaration): void;
    visitMethodDeclaration(node: ts.MethodDeclaration): void;
    private _visitFunctionOrMethodDeclaration;
}
//# sourceMappingURL=async_suffix.d.ts.map