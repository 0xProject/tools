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
exports.FakeGasEstimateSubprovider = void 0;
const subprovider_1 = require("./subprovider");
// HACK: We need this so that our tests don't use testrpc gas estimation which sometimes kills the node.
// Source: https://github.com/trufflesuite/ganache-cli/issues/417
// Source: https://github.com/trufflesuite/ganache-cli/issues/437
// Source: https://github.com/MetaMask/provider-engine/blob/master/subproviders/subprovider.js
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It intercepts the `eth_estimateGas` JSON RPC call and always returns a constant gas amount when queried.
 */
class FakeGasEstimateSubprovider extends subprovider_1.Subprovider {
    /**
     * Instantiates an instance of the FakeGasEstimateSubprovider
     * @param constantGasAmount The constant gas amount you want returned
     */
    constructor(constantGasAmount) {
        super();
        this._constantGasAmount = constantGasAmount;
    }
    /**
     * This method conforms to the web3-provider-engine interface.
     * It is called internally by the ProviderEngine when it is this subproviders
     * turn to handle a JSON RPC request.
     * @param payload JSON RPC payload
     * @param next Callback to call if this subprovider decides not to handle the request
     * @param end Callback to call if subprovider handled the request and wants to pass back the request.
     */
    // tslint:disable-next-line:prefer-function-over-method async-suffix
    handleRequest(payload, next, end) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (payload.method) {
                case 'eth_estimateGas':
                    end(null, this._constantGasAmount);
                    return;
                default:
                    next();
                    return;
            }
        });
    }
}
exports.FakeGasEstimateSubprovider = FakeGasEstimateSubprovider;
//# sourceMappingURL=fake_gas_estimate_subprovider.js.map