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
exports.DebugSubprovider = void 0;
const utils_1 = require("@0x/utils");
const tx_1 = require("@ethereumjs/tx");
const ethereumjs_util_1 = require("ethereumjs-util");
const subprovider_1 = require("./subprovider");
const HEX_BASE = 16;
// tslint:disable-next-line:no-console
const defaultDebugCallback = (debugPayload) => console.debug(JSON.stringify(debugPayload, null, 2));
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * For every request, a object for debugging will be sent to the function specified in the constructor
 * Useful for debugging RPC requests which are not expecting as you expect.
 */
class DebugSubprovider extends subprovider_1.Subprovider {
    constructor(debugCallback = defaultDebugCallback) {
        super();
        this._debugCallback = debugCallback;
    }
    static _generateRawTransactionAttributes(txn) {
        const hexBufferToString = (value) => new utils_1.BigNumber(value.toString('hex'), HEX_BASE).toString();
        let gasPrice;
        if (txn instanceof tx_1.FeeMarketEIP1559Transaction) {
            gasPrice = "0";
        }
        else {
            gasPrice = hexBufferToString(txn.gasPrice);
        }
        return {
            gasLimit: hexBufferToString(txn.gasLimit),
            gasPrice: gasPrice,
            nonce: hexBufferToString(txn.nonce),
            value: hexBufferToString(txn.value),
            // tslint:disable-next-line: no-unnecessary-type-assertion
            to: txn.to.toString(),
        };
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
            const debugPayload = payload;
            if (payload.method === 'eth_sendRawTransaction' && payload.params[0]) {
                const txn = tx_1.TransactionFactory.fromSerializedData(ethereumjs_util_1.toBuffer(payload.params[0]));
                debugPayload.rawTransactionAttributes = DebugSubprovider._generateRawTransactionAttributes(txn);
            }
            this._debugCallback(debugPayload);
            next();
        });
    }
}
exports.DebugSubprovider = DebugSubprovider;
//# sourceMappingURL=debug_subprovider.js.map