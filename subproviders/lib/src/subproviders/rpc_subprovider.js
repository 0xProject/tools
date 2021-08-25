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
exports.RPCSubprovider = void 0;
const assert_1 = require("@0x/assert");
const types_1 = require("@0x/types");
const utils_1 = require("@0x/utils");
// @ts-ignore: json-rpc-error doesn't have types
const json_rpc_error_1 = require("json-rpc-error");
const subprovider_1 = require("./subprovider");
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It forwards on JSON RPC requests to the supplied `rpcUrl` endpoint
 */
class RPCSubprovider extends subprovider_1.Subprovider {
    /**
     * @param rpcUrl URL to the backing Ethereum node to which JSON RPC requests should be sent
     * @param requestTimeoutMs Amount of miliseconds to wait before timing out the JSON RPC request
     */
    constructor(rpcUrl, requestTimeoutMs = 20000) {
        super();
        assert_1.assert.isString('rpcUrl', rpcUrl);
        assert_1.assert.isNumber('requestTimeoutMs', requestTimeoutMs);
        this._rpcUrl = rpcUrl;
        this._requestTimeoutMs = requestTimeoutMs;
    }
    /**
     * This method conforms to the web3-provider-engine interface.
     * It is called internally by the ProviderEngine when it is this subproviders
     * turn to handle a JSON RPC request.
     * @param payload JSON RPC payload
     * @param _next Callback to call if this subprovider decides not to handle the request
     * @param end Callback to call if subprovider handled the request and wants to pass back the request.
     */
    // tslint:disable-next-line:prefer-function-over-method async-suffix
    handleRequest(payload, _next, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const finalPayload = subprovider_1.Subprovider._createFinalPayload(payload);
            const headers = new Headers({
                Accept: 'application/json',
                'Content-Type': 'application/json',
            });
            let response;
            try {
                response = yield utils_1.fetchAsync(this._rpcUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(finalPayload),
                }, this._requestTimeoutMs);
            }
            catch (err) {
                end(new json_rpc_error_1.default.InternalError(err));
                return;
            }
            const text = yield response.text();
            if (!response.ok) {
                const statusCode = response.status;
                switch (statusCode) {
                    case types_1.StatusCodes.MethodNotAllowed:
                        end(new json_rpc_error_1.default.MethodNotFound());
                        return;
                    case types_1.StatusCodes.GatewayTimeout:
                        const errMsg = 'Gateway timeout. The request took too long to process. This can happen when querying logs over too wide a block range.';
                        const err = new Error(errMsg);
                        end(new json_rpc_error_1.default.InternalError(err));
                        return;
                    default:
                        end(new json_rpc_error_1.default.InternalError(text));
                        return;
                }
            }
            let data;
            try {
                data = JSON.parse(text);
            }
            catch (err) {
                end(new json_rpc_error_1.default.InternalError(err));
                return;
            }
            if (data.error) {
                end(data.error);
                return;
            }
            end(null, data.result);
        });
    }
}
exports.RPCSubprovider = RPCSubprovider;
//# sourceMappingURL=rpc_subprovider.js.map