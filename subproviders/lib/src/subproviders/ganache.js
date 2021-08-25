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
exports.GanacheSubprovider = void 0;
const Ganache = require("ganache-core");
const subprovider_1 = require("./subprovider");
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It intercepts all JSON RPC requests and relays them to an in-process ganache instance.
 */
class GanacheSubprovider extends subprovider_1.Subprovider {
    /**
     * Instantiates a GanacheSubprovider
     * @param opts The desired opts with which to instantiate the Ganache provider
     */
    constructor(opts) {
        super();
        // @ts-ignore: Ganace.Provider has sendAsync, it's just missing from the type
        this._ganacheProvider = Ganache.provider(opts);
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
            this._ganacheProvider.sendAsync(payload, (err, result) => {
                end(err, result && result.result);
            });
        });
    }
}
exports.GanacheSubprovider = GanacheSubprovider;
//# sourceMappingURL=ganache.js.map