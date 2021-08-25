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
exports.SignerSubprovider = void 0;
const web3_wrapper_1 = require("@0x/web3-wrapper");
const subprovider_1 = require("./subprovider");
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine)
 * subprovider interface. It forwards JSON RPC requests involving the domain of a signer (getAccounts,
 * sendTransaction, signMessage etc...) to the provider instance supplied at instantiation. All other requests
 * are passed onwards for subsequent subproviders to handle.
 */
class SignerSubprovider extends subprovider_1.Subprovider {
    /**
     * Instantiates a new SignerSubprovider.
     * @param supportedProvider Web3 provider that should handle  all user account related requests
     */
    constructor(supportedProvider) {
        super();
        this._web3Wrapper = new web3_wrapper_1.Web3Wrapper(supportedProvider);
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
            let message;
            let address;
            switch (payload.method) {
                case 'web3_clientVersion':
                    try {
                        const nodeVersion = yield this._web3Wrapper.getNodeVersionAsync();
                        end(null, nodeVersion);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_accounts':
                    try {
                        const accounts = yield this._web3Wrapper.getAvailableAddressesAsync();
                        end(null, accounts);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_sendTransaction':
                    const [txParams] = payload.params;
                    try {
                        const txData = web3_wrapper_1.marshaller.unmarshalTxData(txParams);
                        const txHash = yield this._web3Wrapper.sendTransactionAsync(txData);
                        end(null, txHash);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_sign':
                    [address, message] = payload.params;
                    try {
                        const signature = yield this._web3Wrapper.signMessageAsync(address, message);
                        end(null, signature);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_signTypedData':
                    [address, message] = payload.params;
                    try {
                        const signature = yield this._web3Wrapper.signTypedDataAsync(address, message);
                        end(null, signature);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                default:
                    next();
                    return;
            }
        });
    }
}
exports.SignerSubprovider = SignerSubprovider;
//# sourceMappingURL=signer.js.map