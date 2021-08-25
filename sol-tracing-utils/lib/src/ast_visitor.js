"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTVisitor = void 0;
const _ = require("lodash");
var BranchType;
(function (BranchType) {
    BranchType["If"] = "if";
    BranchType["ConditionalExpression"] = "cond-expr";
    BranchType["BinaryExpression"] = "binary-expr";
})(BranchType || (BranchType = {}));
class ASTVisitor {
    constructor(offsetToLocation, ignoreRangesBeginningAt = []) {
        this._entryId = 0;
        this._fnMap = {};
        this._branchMap = {};
        this._modifiersStatementIds = [];
        this._statementMap = {};
        // keep track of contract/function ranges that are to be ignored
        // so we can also ignore any children nodes within the contract/function
        this._ignoreRangesWithin = [];
        this._offsetToLocation = offsetToLocation;
        this._ignoreRangesBeginningAt = ignoreRangesBeginningAt;
    }
    getCollectedCoverageEntries() {
        const coverageEntriesDescription = {
            fnMap: this._fnMap,
            branchMap: this._branchMap,
            statementMap: this._statementMap,
            modifiersStatementIds: this._modifiersStatementIds,
        };
        return coverageEntriesDescription;
    }
    IfStatement(ast) {
        this._visitStatement(ast);
        this._visitBinaryBranch(ast, ast.trueBody, ast.falseBody || ast, BranchType.If);
    }
    FunctionDefinition(ast) {
        this._visitFunctionLikeDefinition(ast);
    }
    ContractDefinition(ast) {
        if (this._shouldIgnoreExpression(ast)) {
            this._ignoreRangesWithin.push(ast.range);
        }
    }
    ModifierDefinition(ast) {
        this._visitFunctionLikeDefinition(ast);
    }
    ForStatement(ast) {
        this._visitStatement(ast);
    }
    ReturnStatement(ast) {
        this._visitStatement(ast);
    }
    BreakStatement(ast) {
        this._visitStatement(ast);
    }
    ContinueStatement(ast) {
        this._visitStatement(ast);
    }
    EmitStatement(ast /* TODO: Parser.EmitStatement */) {
        this._visitStatement(ast);
    }
    VariableDeclarationStatement(ast) {
        this._visitStatement(ast);
    }
    WhileStatement(ast) {
        this._visitStatement(ast);
    }
    ThrowStatement(ast) {
        this._visitStatement(ast);
    }
    DoWhileStatement(ast) {
        this._visitStatement(ast);
    }
    ExpressionStatement(ast) {
        if (ast.expression !== null) {
            this._visitStatement(ast.expression);
        }
    }
    InlineAssemblyStatement(ast) {
        this._visitStatement(ast);
    }
    AssemblyLocalDefinition(ast) {
        this._visitStatement(ast);
    }
    AssemblyCall(ast) {
        this._visitStatement(ast);
    }
    AssemblyIf(ast) {
        this._visitStatement(ast);
    }
    AssemblyBlock(ast) {
        this._visitStatement(ast);
    }
    AssemblyAssignment(ast) {
        this._visitStatement(ast);
    }
    LabelDefinition(ast) {
        this._visitStatement(ast);
    }
    AssemblySwitch(ast) {
        this._visitStatement(ast);
    }
    AssemblyFunctionDefinition(ast) {
        this._visitStatement(ast);
    }
    AssemblyFor(ast) {
        this._visitStatement(ast);
    }
    SubAssembly(ast) {
        this._visitStatement(ast);
    }
    BinaryOperation(ast) {
        const BRANCHING_BIN_OPS = ['&&', '||'];
        if (_.includes(BRANCHING_BIN_OPS, ast.operator)) {
            this._visitBinaryBranch(ast, ast.left, ast.right, BranchType.BinaryExpression);
        }
    }
    Conditional(ast) {
        this._visitBinaryBranch(ast, ast.trueExpression, ast.falseExpression, BranchType.ConditionalExpression);
    }
    ModifierInvocation(ast) {
        const BUILTIN_MODIFIERS = ['public', 'view', 'payable', 'external', 'internal', 'pure', 'constant'];
        if (!_.includes(BUILTIN_MODIFIERS, ast.name)) {
            if (this._shouldIgnoreExpression(ast)) {
                return;
            }
            this._modifiersStatementIds.push(this._entryId);
            this._visitStatement(ast);
        }
    }
    _visitBinaryBranch(ast, left, right, type) {
        if (this._shouldIgnoreExpression(ast)) {
            return;
        }
        this._branchMap[this._entryId++] = {
            line: this._getExpressionRange(ast).start.line,
            type,
            locations: [this._getExpressionRange(left), this._getExpressionRange(right)],
        };
    }
    _visitStatement(ast) {
        if (this._shouldIgnoreExpression(ast)) {
            return;
        }
        this._statementMap[this._entryId++] = this._getExpressionRange(ast);
    }
    _getExpressionRange(ast) {
        const astRange = ast.range;
        const start = this._offsetToLocation[astRange[0]];
        const end = this._offsetToLocation[astRange[1] + 1];
        const range = {
            start,
            end,
        };
        return range;
    }
    _shouldIgnoreExpression(ast) {
        const [astStart, astEnd] = ast.range;
        const isRangeIgnored = _.some(this._ignoreRangesWithin, ([rangeStart, rangeEnd]) => astStart >= rangeStart && astEnd <= rangeEnd);
        return this._ignoreRangesBeginningAt.includes(astStart) || isRangeIgnored;
    }
    _visitFunctionLikeDefinition(ast) {
        if (this._shouldIgnoreExpression(ast)) {
            this._ignoreRangesWithin.push(ast.range);
            return;
        }
        const loc = this._getExpressionRange(ast);
        this._fnMap[this._entryId++] = {
            name: ast.name || '',
            line: loc.start.line,
            loc,
        };
        this._visitStatement(ast);
    }
}
exports.ASTVisitor = ASTVisitor;
//# sourceMappingURL=ast_visitor.js.map