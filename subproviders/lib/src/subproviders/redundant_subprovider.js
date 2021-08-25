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
exports.RedundantSubprovider = void 0;
const util_1 = require("util");
const subprovider_1 = require("./subprovider");
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It attempts to handle each JSON RPC request by sequentially attempting to receive a valid response from one of a
 * set of JSON RPC endpoints.
 */
class RedundantSubprovider extends subprovider_1.Subprovider {
    /**
     * Instantiates a new RedundantSubprovider
     * @param subproviders Subproviders to attempt the request with
     */
    constructor(subproviders) {
        super();
        this._subproviders = subproviders;
    }
    static _firstSuccessAsync(subproviders, payload, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastErr;
            for (const subprovider of subproviders) {
                try {
                    const data = yield util_1.promisify(subprovider.handleRequest.bind(subprovider))(payload, next);
                    return data;
                }
                catch (err) {
                    lastErr = err;
                    continue;
                }
            }
            if (lastErr !== undefined) {
                throw lastErr;
            }
        });
    }
    /**
     * This method conforms to the web3-provider-engine interface.
     * It is called internally by the ProviderEngine when it is this subproviders
     * turn to handle a JSON RPC request.
     * @param payload JSON RPC payload
     * @param next Callback to call if this subprovider decides not to handle the request
     * @param end Callback to call if subprovider handled the request and wants to pass back the request.
     */
    // tslint:disable-next-line:async-suffix
    handleRequest(payload, next, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const subprovidersCopy = this._subproviders.slice();
            try {
                const data = yield RedundantSubprovider._firstSuccessAsync(subprovidersCopy, payload, next);
                end(null, data);
            }
            catch (err) {
                end(err);
            }
        });
    }
}
exports.RedundantSubprovider = RedundantSubprovider;
//# sourceMappingURL=redundant_subprovider.js.map