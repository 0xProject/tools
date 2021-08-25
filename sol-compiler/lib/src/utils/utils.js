"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = void 0;
exports.utils = {
    stringifyWithFormatting(obj) {
        const stringifiedObj = JSON.stringify(obj, null, '\t');
        return stringifiedObj;
    },
};
//# sourceMappingURL=utils.js.map