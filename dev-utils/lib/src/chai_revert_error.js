"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revertErrorHelper = void 0;
const utils_1 = require("@0x/utils");
function revertErrorHelper(_chai) {
    const proto = _chai.Assertion;
    proto.overwriteMethod('revertWith', function (_super) {
        return function (expected, ...rest) {
            return __awaiter(this, void 0, void 0, function* () {
                const maybePromise = this._obj;
                // Make sure we're working with a promise.
                assertIsPromiseLike(_chai, maybePromise);
                // Wait for the promise to reject.
                let resolveValue;
                let rejectValue;
                let didReject = false;
                try {
                    resolveValue = yield maybePromise;
                }
                catch (err) {
                    rejectValue = err;
                    didReject = true;
                }
                if (!didReject) {
                    chaiFail(_chai, `Expected promise to reject but instead resolved with: ${resolveValue}`);
                }
                if (!compareRevertErrors.call(this, _chai, rejectValue, expected, true)) {
                    // Wasn't handled by the comparison function so call the previous handler.
                    return _super.call(this, expected, ...rest);
                }
            });
        };
    });
    proto.overwriteMethod('become', function (_super) {
        return function (expected, ...rest) {
            return __awaiter(this, void 0, void 0, function* () {
                const maybePromise = this._obj;
                // Make sure we're working with a promise.
                assertIsPromiseLike(_chai, maybePromise);
                // Wait for the promise to resolve.
                if (!compareRevertErrors.call(this, _chai, yield maybePromise, expected)) {
                    // Wasn't handled by the comparison function so call the previous handler.
                    return _super.call(this, expected, ...rest);
                }
            });
        };
    });
    proto.overwriteMethod('equal', function (_super) {
        return function (expected, ...rest) {
            if (!compareRevertErrors.call(this, _chai, this._obj, expected)) {
                // Wasn't handled by the comparison function so call the previous handler.
                _super.call(this, expected, ...rest);
            }
        };
    });
}
exports.revertErrorHelper = revertErrorHelper;
/**
 * Compare two values as compatible RevertError types.
 * @return `true` if the comparison was fully evaluated. `false` indicates that
 *         it should be deferred to another handler.
 */
function compareRevertErrors(_chai, _actual, _expected, force) {
    let actual = _actual;
    let expected = _expected;
    // If either subject is a RevertError, or the `force` is `true`,
    // try to coerce the subjects into a RevertError.
    // Some of this is for convenience, some is for backwards-compatibility.
    if (force || expected instanceof utils_1.RevertError || actual instanceof utils_1.RevertError) {
        // `actual` can be a RevertError, string, or an Error type.
        if (!(actual instanceof utils_1.RevertError)) {
            if (typeof actual === 'string') {
                actual = new utils_1.StringRevertError(actual);
            }
            else if (actual instanceof Error) {
                actual = utils_1.coerceThrownErrorAsRevertError(actual);
            }
            else {
                chaiAssert(_chai, false, `Result is not of type RevertError: ${actual}`);
            }
        }
        // `expected` can be a RevertError or string.
        if (typeof expected === 'string') {
            expected = new utils_1.StringRevertError(expected);
        }
    }
    if (expected instanceof utils_1.RevertError && actual instanceof utils_1.RevertError) {
        // Check for equality.
        this.assert(expected.equals(actual), `${actual.toString()} != ${expected.toString()}`, `${actual.toString()} == ${expected.toString()}`, expected.toString(), actual.toString());
        // Return true to signal we handled it.
        return true;
    }
    return false;
}
function chaiAssert(_chai, condition, failMessage, expected, actual) {
    const assert = new _chai.Assertion();
    assert.assert(condition, failMessage, undefined, expected, actual);
}
function chaiFail(_chai, failMessage, expected, actual) {
    const assert = new _chai.Assertion();
    assert.assert(false, failMessage, undefined, expected, actual);
}
function assertIsPromiseLike(_chai, maybePromise) {
    if (maybePromise.then instanceof Function && maybePromise.catch instanceof Function) {
        return;
    }
    chaiFail(_chai, `Expected ${maybePromise} to be a promise`, Promise.resolve(), maybePromise);
}
//# sourceMappingURL=chai_revert_error.js.map