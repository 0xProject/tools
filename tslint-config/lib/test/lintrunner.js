"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixedResult = exports.helper = void 0;
const path = require("path");
const tslint_1 = require("tslint");
const helper = (src, rule) => {
    const linter = new tslint_1.Linter({ fix: false });
    linter.lint('', src, tslint_1.Configuration.parseConfigFile({
        rules: {
            [rule]: true,
        },
        rulesDirectory: path.join(__dirname, '../rules'),
    }));
    return linter.getResult();
};
exports.helper = helper;
const getFixedResult = (src, rule) => {
    const result = exports.helper(src, rule);
    const fixes = [].concat.apply(result.failures.map(x => x.getFix()));
    return tslint_1.Replacement.applyFixes(src, fixes);
};
exports.getFixedResult = getFixedResult;
//# sourceMappingURL=lintrunner.js.map