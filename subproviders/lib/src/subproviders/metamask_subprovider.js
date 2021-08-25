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
exports.MetamaskSubprovider = void 0;
const utils_1 = require("@0x/utils");
const web3_wrapper_1 = require("@0x/web3-wrapper");
const subprovider_1 = require("./subprovider");
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine)
 * subprovider interface and the provider sendAsync interface.
 * It handles inconsistencies with Metamask implementations of various JSON RPC methods.
 * It forwards JSON RPC requests involving the domain of a signer (getAccounts,
 * sendTransaction, signMessage etc...) to the provider instance supplied at instantiation. All other requests
 * are passed onwards for subsequent subproviders to handle.
 */
class MetamaskSubprovider extends subprovider_1.Subprovider {
    /**
     * Instantiates a new MetamaskSubprovider
     * @param supportedProvider Web3 provider that should handle  all user account related requests
     */
    constructor(supportedProvider) {
        super();
        const provider = utils_1.providerUtils.standardizeOrThrow(supportedProvider);
        this._web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider);
        this._provider = provider;
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
                        // Metamask incorrectly implements eth_sign and does not prefix the message as per the spec
                        // It does however implement personal_sign and will leave off the prefix when used as a proxy for hardware wallets
                        // Source: https://metamask.github.io/metamask-docs/API_Reference/Signing_Data/Personal_Sign
                        // See: https://github.com/MetaMask/eth-ledger-bridge-keyring/blob/master/index.js#L192
                        // and https://github.com/MetaMask/eth-trezor-keyring/blob/master/index.js#L211
                        // and https://github.com/MetaMask/eth-sig-util/blob/master/index.js#L250
                        const signature = yield this._web3Wrapper.sendRawPayloadAsync({
                            method: 'personal_sign',
                            params: [message, address],
                        });
                        signature ? end(null, signature) : end(new Error('Error performing eth_sign'), null);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                // Metamask supports different versions of the `eth_signTypedData` RPC method.
                case 'eth_signTypedData':
                case 'eth_signTypedData_v3':
                case 'eth_signTypedData_v4':
                    [address, message] = payload.params;
                    try {
                        // We accept either JSON-serialized or object messages.
                        const messageObject = typeof message === 'object' ? message : JSON.parse(message);
                        const signature = yield this._web3Wrapper.sendRawPayloadAsync({
                            method: payload.method,
                            // `eth_signTypedData` takes a raw object.
                            params: [
                                address,
                                payload.method === 'eth_signTypedData' ? messageObject : JSON.stringify(messageObject),
                            ],
                        });
                        signature ? end(null, signature) : end(new Error('Error performing eth_signTypedData'), null);
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
    /**
     * This method conforms to the provider sendAsync interface.
     * Allowing the MetamaskSubprovider to be used as a generic provider (outside of Web3ProviderEngine) with the
     * addition of wrapping the inconsistent Metamask behaviour
     * @param payload JSON RPC payload
     * @return The contents nested under the result key of the response body
     */
    sendAsync(payload, callback) {
        void this.handleRequest(payload, 
        // handleRequest has decided to not handle this, so fall through to the provider
        () => {
            const sendAsync = this._provider.sendAsync.bind(this._provider);
            sendAsync(payload, callback);
        }, 
        // handleRequest has called end and will handle this
        (err, data) => {
            err ? callback(err) : callback(null, Object.assign(Object.assign({}, payload), { result: data }));
        });
    }
}
exports.MetamaskSubprovider = MetamaskSubprovider;
//# sourceMappingURL=metamask_subprovider.js.map