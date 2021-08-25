"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackErrorReporter = void 0;
const chai = require("chai");
const expect = chai.expect;
exports.callbackErrorReporter = {
    reportNoErrorCallbackErrors(done, expectToBeCalledOnce = true) {
        const callback = (f) => {
            const wrapped = (value) => {
                if (f === undefined) {
                    done();
                    return;
                }
                try {
                    f(value);
                    if (expectToBeCalledOnce) {
                        done();
                    }
                }
                catch (err) {
                    done(err);
                }
            };
            return wrapped;
        };
        return callback;
    },
    reportNodeCallbackErrors(done, expectToBeCalledOnce = true) {
        const callback = (f) => {
            const wrapped = (error, value) => {
                if (error !== null) {
                    done(error);
                }
                else {
                    if (f === undefined) {
                        done();
                        return;
                    }
                    try {
                        f(value);
                        if (expectToBeCalledOnce) {
                            done();
                        }
                    }
                    catch (err) {
                        done(err);
                    }
                }
            };
            return wrapped;
        };
        return callback;
    },
    assertNodeCallbackError(done, errMsg) {
        const wrapped = (error, _value) => {
            if (error === null) {
                done(new Error('Expected callback to receive an error'));
            }
            else {
                try {
                    expect(error.message).to.be.equal(errMsg);
                    done();
                }
                catch (err) {
                    done(err);
                }
            }
        };
        return wrapped;
    },
};
//# sourceMappingURL=callback_error_reporter.js.map