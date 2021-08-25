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
exports.BaseWalletSubprovider = void 0;
const assert_1 = require("@0x/assert");
const utils_1 = require("@0x/utils");
const types_1 = require("../types");
const subprovider_1 = require("./subprovider");
class BaseWalletSubprovider extends subprovider_1.Subprovider {
    static _validateTxParams(txParams) {
        if (txParams.to !== undefined) {
            assert_1.assert.isETHAddressHex('to', txParams.to);
        }
        assert_1.assert.isHexString('nonce', txParams.nonce);
    }
    static _validateSender(sender) {
        if (sender === undefined || !utils_1.addressUtils.isAddress(sender)) {
            throw new Error(types_1.WalletSubproviderErrors.SenderInvalidOrNotSupplied);
        }
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
            let accounts;
            let txParams;
            let address;
            let typedData;
            switch (payload.method) {
                case 'eth_coinbase':
                    try {
                        accounts = yield this.getAccountsAsync();
                        end(null, accounts[0]);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_accounts':
                    try {
                        accounts = yield this.getAccountsAsync();
                        end(null, accounts);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_sendTransaction':
                    txParams = payload.params[0];
                    try {
                        BaseWalletSubprovider._validateSender(txParams.from);
                        const filledParams = yield this._populateMissingTxParamsAsync(txParams);
                        const signedTx = yield this.signTransactionAsync(filledParams);
                        const response = yield this._emitSendTransactionAsync(signedTx);
                        end(null, response.result);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_signTransaction':
                    txParams = payload.params[0];
                    try {
                        const filledParams = yield this._populateMissingTxParamsAsync(txParams);
                        const signedTx = yield this.signTransactionAsync(filledParams);
                        const result = {
                            raw: signedTx,
                            tx: txParams,
                        };
                        end(null, result);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_sign':
                case 'personal_sign':
                    const data = payload.method === 'eth_sign' ? payload.params[1] : payload.params[0];
                    address = payload.method === 'eth_sign' ? payload.params[0] : payload.params[1];
                    try {
                        const ecSignatureHex = yield this.signPersonalMessageAsync(data, address);
                        end(null, ecSignatureHex);
                    }
                    catch (err) {
                        end(err);
                    }
                    return;
                case 'eth_signTypedData':
                    [address, typedData] = payload.params;
                    try {
                        const signature = yield this.signTypedDataAsync(address, typedData);
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
    _emitSendTransactionAsync(signedTx) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                method: 'eth_sendRawTransaction',
                params: [signedTx],
            };
            const result = yield this.emitPayloadAsync(payload);
            return result;
        });
    }
    _populateMissingTxParamsAsync(partialTxParams) {
        return __awaiter(this, void 0, void 0, function* () {
            let txParams = partialTxParams;
            if (partialTxParams.gasPrice === undefined) {
                const gasPriceResult = yield this.emitPayloadAsync({
                    method: 'eth_gasPrice',
                    params: [],
                });
                const gasPrice = gasPriceResult.result.toString();
                txParams = Object.assign(Object.assign({}, txParams), { gasPrice });
            }
            if (partialTxParams.nonce === undefined) {
                const nonceResult = yield this.emitPayloadAsync({
                    method: 'eth_getTransactionCount',
                    params: [partialTxParams.from, 'pending'],
                });
                const nonce = nonceResult.result;
                txParams = Object.assign(Object.assign({}, txParams), { nonce });
            }
            if (partialTxParams.gas === undefined) {
                const gasResult = yield this.emitPayloadAsync({
                    method: 'eth_estimateGas',
                    params: [partialTxParams],
                });
                const gas = gasResult.result.toString();
                txParams = Object.assign(Object.assign({}, txParams), { gas });
            }
            return txParams;
        });
    }
}
exports.BaseWalletSubprovider = BaseWalletSubprovider;
//# sourceMappingURL=base_wallet_subprovider.js.map