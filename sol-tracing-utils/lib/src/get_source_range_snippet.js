"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceRangeSnippet = void 0;
const utils_1 = require("./utils");
/**
 * Gets the source range snippet by source range to be used by revert trace.
 * @param sourceRange source range
 * @param sourceCode source code
 */
function getSourceRangeSnippet(sourceRange, sourceCode) {
    const sourceCodeInRange = utils_1.utils.getRange(sourceCode, sourceRange.location);
    return {
        range: sourceRange.location,
        source: sourceCodeInRange,
        fileName: sourceRange.fileName,
    };
}
exports.getSourceRangeSnippet = getSourceRangeSnippet;
//# sourceMappingURL=get_source_range_snippet.js.map