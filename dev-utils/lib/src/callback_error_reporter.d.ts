import { DoneCallback } from '@0x/types';
export declare const callbackErrorReporter: {
    reportNoErrorCallbackErrors(done: DoneCallback, expectToBeCalledOnce?: boolean): <T>(f?: ((value: T) => void) | undefined) => (value: T) => void;
    reportNodeCallbackErrors(done: DoneCallback, expectToBeCalledOnce?: boolean): <T_1>(f?: ((value: T_1) => void) | undefined) => (error: Error | null, value: T_1 | undefined) => void;
    assertNodeCallbackError(done: DoneCallback, errMsg: string): <T_2>(error: Error | null, value: T_2 | undefined) => void;
};
//# sourceMappingURL=callback_error_reporter.d.ts.map