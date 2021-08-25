"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectCoverageEntries = void 0;
const ethUtil = require("ethereumjs-util");
const parser = require("solidity-parser-antlr");
const ast_visitor_1 = require("./ast_visitor");
const source_maps_1 = require("./source_maps");
// Parsing source code for each transaction/code is slow and therefore we cache it
const sourceHashToCoverageEntries = {};
const collectCoverageEntries = (contractSource, ignoreRegexp) => {
    const sourceHash = ethUtil.keccak256(Buffer.from(contractSource)).toString('hex');
    if (sourceHashToCoverageEntries[sourceHash] === undefined && contractSource !== undefined) {
        const ast = parser.parse(contractSource, { range: true });
        const offsetToLocation = source_maps_1.getOffsetToLocation(contractSource);
        const ignoreRangesBeginningAt = ignoreRegexp === undefined ? [] : gatherRangesToIgnore(contractSource, ignoreRegexp);
        const visitor = new ast_visitor_1.ASTVisitor(offsetToLocation, ignoreRangesBeginningAt);
        parser.visit(ast, visitor);
        sourceHashToCoverageEntries[sourceHash] = visitor.getCollectedCoverageEntries();
    }
    const coverageEntriesDescription = sourceHashToCoverageEntries[sourceHash];
    return coverageEntriesDescription;
};
exports.collectCoverageEntries = collectCoverageEntries;
// Gather the start index of all code blocks preceeded by "/* solcov ignore next */"
function gatherRangesToIgnore(contractSource, ignoreRegexp) {
    const ignoreRangesStart = [];
    let match;
    do {
        match = ignoreRegexp.exec(contractSource);
        if (match) {
            const matchLen = match[0].length;
            ignoreRangesStart.push(match.index + matchLen);
        }
    } while (match);
    return ignoreRangesStart;
}
//# sourceMappingURL=collect_coverage_entries.js.map