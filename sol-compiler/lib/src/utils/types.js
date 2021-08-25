"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilationError = exports.AbiType = void 0;
var AbiType;
(function (AbiType) {
    AbiType["Function"] = "function";
    AbiType["Constructor"] = "constructor";
    AbiType["Event"] = "event";
    AbiType["Fallback"] = "fallback";
})(AbiType = exports.AbiType || (exports.AbiType = {}));
class CompilationError extends Error {
    constructor(errorsCount) {
        super('Compilation errors encountered');
        this.typeName = 'CompilationError';
        this.errorsCount = errorsCount;
    }
}
exports.CompilationError = CompilationError;
//# sourceMappingURL=types.js.map