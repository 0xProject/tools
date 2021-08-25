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
exports.PrivateKeyWalletSubprovider = void 0;
const assert_1 = require("@0x/assert");
const utils_1 = require("@0x/utils");
const common_1 = require("@ethereumjs/common");
const tx_1 = require("@ethereumjs/tx");
const ethUtil = require("ethereumjs-util");
const types_1 = require("../types");
const base_wallet_subprovider_1 = require("./base_wallet_subprovider");
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * This subprovider intercepts all account related RPC requests (e.g message/transaction signing, etc...) and handles
 * all requests with the supplied Ethereum private key.
 */
class PrivateKeyWalletSubprovider extends base_wallet_subprovider_1.BaseWalletSubprovider {
    /**
     * Instantiates a PrivateKeyWalletSubprovider.
     * @param privateKey The corresponding private key to an Ethereum address
     * @param chainId The chain ID. Defaults to 1 (mainnet).
     * @param hardfork The active hardfork on the chain. Defaults to 'istanbul'.
     * @return PrivateKeyWalletSubprovider instance
     */
    constructor(privateKey, chainId = 1, hardfork) {
        assert_1.assert.isString('privateKey', privateKey);
        super();
        this._privateKeyBuffer = Buffer.from(privateKey, 'hex');
        this._address = `0x${ethUtil.privateToAddress(this._privateKeyBuffer).toString('hex')}`;
        this._common = common_1.default.forCustomChain('mainnet', { chainId }, hardfork);
    }
    /**
     * Retrieve the account associated with the supplied private key.
     * This method is implicitly called when issuing a `eth_accounts` JSON RPC request
     * via your providerEngine instance.
     * @return An array of accounts
     */
    getAccountsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return [this._address];
        });
    }
    /**
     * Sign a transaction with the private key. If you've added this Subprovider to your
     * app's provider, you can simply send an `eth_sendTransaction` JSON RPC request, and
     * this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    signTransactionAsync(txParams) {
        return __awaiter(this, void 0, void 0, function* () {
            PrivateKeyWalletSubprovider._validateTxParams(txParams);
            if (txParams.from !== undefined && txParams.from.toLowerCase() !== this._address.toLowerCase()) {
                throw new Error(`Requested to sign transaction with address: ${txParams.from}, instantiated with address: ${this._address}`);
            }
            const tx = tx_1.TransactionFactory.fromTxData(Object.assign({ to: txParams.to, gasPrice: txParams.gasPrice, gasLimit: txParams.gas, value: txParams.value, data: txParams.data, nonce: txParams.nonce }, (this._common.hardfork() === 'istanbul'
                ? {}
                : {
                    type: txParams.type,
                    accessList: txParams.accessList,
                    chainId: this._common.chainId(),
                })), { common: this._common }).sign(this._privateKeyBuffer);
            const rawTx = `0x${tx.serialize().toString('hex')}`;
            return rawTx;
        });
    }
    /**
     * Sign a personal Ethereum signed message. The signing address will be calculated from the private key.
     * The address must be provided it must match the address calculated from the private key.
     * If you've added this Subprovider to your app's provider, you can simply send an `eth_sign`
     * or `personal_sign` JSON RPC request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param data Hex string message to sign
     * @param address Address of the account to sign with
     * @return Signature hex string (order: rsv)
     */
    signPersonalMessageAsync(data, address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data === undefined) {
                throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignPersonalMessage);
            }
            assert_1.assert.isHexString('data', data);
            assert_1.assert.isETHAddressHex('address', address);
            if (address.toLowerCase() !== this._address.toLowerCase()) {
                throw new Error(`Requested to sign message with address: ${address}, instantiated with address: ${this._address}`);
            }
            const dataBuff = ethUtil.toBuffer(data);
            const msgHashBuff = ethUtil.hashPersonalMessage(dataBuff);
            const sig = ethUtil.ecsign(msgHashBuff, this._privateKeyBuffer);
            const rpcSig = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
            return rpcSig;
        });
    }
    /**
     * Sign an EIP712 Typed Data message. The signing address will be calculated from the private key.
     * The address must be provided it must match the address calculated from the private key.
     * If you've added this Subprovider to your app's provider, you can simply send an `eth_signTypedData`
     * JSON RPC request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param address Address of the account to sign with
     * @param data the typed data object
     * @return Signature hex string (order: rsv)
     */
    signTypedDataAsync(address, typedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typedData === undefined) {
                throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignTypedData);
            }
            assert_1.assert.isETHAddressHex('address', address);
            if (address.toLowerCase() !== this._address.toLowerCase()) {
                throw new Error(`Requested to sign message with address: ${address}, instantiated with address: ${this._address}`);
            }
            const dataBuff = utils_1.signTypedDataUtils.generateTypedDataHash(typedData);
            const sig = ethUtil.ecsign(dataBuff, this._privateKeyBuffer);
            const rpcSig = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
            return rpcSig;
        });
    }
}
exports.PrivateKeyWalletSubprovider = PrivateKeyWalletSubprovider;
//# sourceMappingURL=private_key_wallet.js.map