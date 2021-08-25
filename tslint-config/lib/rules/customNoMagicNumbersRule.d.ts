import * as Lint from 'tslint';
import * as ts from 'typescript';
/**
 * A modified version of the no-magic-numbers rule that allows for magic numbers
 * when instantiating a BigNumber instance.
 * E.g We want to be able to write:
 *     const amount = new BigNumber(5);
 * Original source: https://github.com/palantir/tslint/blob/42b058a6baa688f8be8558b277eb056c3ff79818/src/rules/noMagicNumbersRule.ts
 */
export declare class Rule extends Lint.Rules.AbstractRule {
    static ALLOWED_NODES: Set<ts.SyntaxKind>;
    static DEFAULT_ALLOWED: number[];
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
//# sourceMappingURL=customNoMagicNumbersRule.d.ts.map