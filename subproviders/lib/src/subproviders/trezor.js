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
exports.TrezorSubprovider = void 0;
const assert_1 = require("@0x/assert");
const utils_1 = require("@0x/utils");
const common_1 = require("@ethereumjs/common");
const tx_1 = require("@ethereumjs/tx");
const _ = require("lodash");
const HDNode = require("hdkey");
const types_1 = require("../types");
const wallet_utils_1 = require("../utils/wallet_utils");
const base_wallet_subprovider_1 = require("./base_wallet_subprovider");
const PRIVATE_KEY_PATH = `44'/60'/0'/0`;
const DEFAULT_NUM_ADDRESSES_TO_FETCH = 10;
const DEFAULT_ADDRESS_SEARCH_LIMIT = 1000;
class TrezorSubprovider extends base_wallet_subprovider_1.BaseWalletSubprovider {
    /**
     * Instantiates a TrezorSubprovider. Defaults to private key path set to `44'/60'/0'/0/`.
     * Must be initialized with trezor-connect API module https://github.com/trezor/connect.
     * @param TrezorSubprovider config object containing trezor-connect API
     * @return TrezorSubprovider instance
     */
    constructor(config) {
        super();
        this._privateKeyPath = PRIVATE_KEY_PATH;
        this._trezorConnectClientApi = config.trezorConnectClientApi;
        this._networkId = config.networkId;
        this._addressSearchLimit =
            config.accountFetchingConfigs !== undefined &&
                config.accountFetchingConfigs.addressSearchLimit !== undefined
                ? config.accountFetchingConfigs.addressSearchLimit
                : DEFAULT_ADDRESS_SEARCH_LIMIT;
        this._common = common_1.default.forCustomChain('mainnet', { chainId: this._networkId });
    }
    /**
     * Retrieve a users Trezor account. This method is automatically called
     * when issuing a `eth_accounts` JSON RPC request via your providerEngine
     * instance.
     * @return An array of accounts
     */
    getAccountsAsync(numberOfAccounts = DEFAULT_NUM_ADDRESSES_TO_FETCH) {
        return __awaiter(this, void 0, void 0, function* () {
            const initialDerivedKeyInfo = yield this._initialDerivedKeyInfoAsync();
            const derivedKeyInfos = wallet_utils_1.walletUtils.calculateDerivedHDKeyInfos(initialDerivedKeyInfo, numberOfAccounts);
            const accounts = _.map(derivedKeyInfos, k => k.address);
            return accounts;
        });
    }
    /**
     * Signs a transaction on the Trezor with the account specificed by the `from` field in txParams.
     * If you've added the TrezorSubprovider to your app's provider, you can simply send an `eth_sendTransaction`
     * JSON RPC request, and this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    signTransactionAsync(txData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (txData.from === undefined || !utils_1.addressUtils.isAddress(txData.from)) {
                throw new Error(types_1.WalletSubproviderErrors.FromAddressMissingOrInvalid);
            }
            // Normalize and omit some fields.
            const _txData = {
                to: txData.to,
                nonce: txData.nonce,
                value: txData.value ? txData.value : '0x0',
                data: txData.data ? txData.data : '0x',
                gasLimit: txData.gas ? txData.gas : '0x0',
                gasPrice: txData.gasPrice ? txData.gasPrice : '0x0',
            };
            const initialDerivedKeyInfo = yield this._initialDerivedKeyInfoAsync();
            const derivedKeyInfo = this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, txData.from);
            const fullDerivationPath = derivedKeyInfo.derivationPath;
            const response = yield this._trezorConnectClientApi.ethereumSignTransaction({
                path: fullDerivationPath,
                transaction: {
                    to: _txData.to,
                    value: _txData.value,
                    data: _txData.data,
                    chainId: this._networkId,
                    nonce: _txData.nonce,
                    gasLimit: _txData.gasLimit,
                    gasPrice: _txData.gasPrice,
                },
            });
            if (response.success) {
                const payload = response.payload;
                const signedTx = tx_1.Transaction.fromTxData(Object.assign(Object.assign({}, _txData), { v: payload.v, r: payload.r, s: payload.s }), { common: this._common });
                return `0x${signedTx.serialize().toString('hex')}`;
            }
            else {
                const payload = response.payload;
                throw new Error(payload.error);
            }
        });
    }
    /**
     * Sign a personal Ethereum signed message. The signing account will be the account
     * associated with the provided address. If you've added the TrezorSubprovider to
     * your app's provider, you can simply send an `eth_sign` or `personal_sign` JSON RPC
     * request, and this method will be called auto-magically.
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
            const initialDerivedKeyInfo = yield this._initialDerivedKeyInfoAsync();
            const derivedKeyInfo = this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, address);
            const fullDerivationPath = derivedKeyInfo.derivationPath;
            const response = yield this._trezorConnectClientApi.ethereumSignMessage({
                path: fullDerivationPath,
                message: data,
                hex: true,
            });
            if (response.success) {
                const payload = response.payload;
                return `0x${payload.signature}`;
            }
            else {
                const payload = response.payload;
                throw new Error(payload.error);
            }
        });
    }
    /**
     * TODO:: eth_signTypedData is currently not supported on Trezor devices.
     * @param address Address of the account to sign with
     * @param data the typed data object
     * @return Signature hex string (order: rsv)
     */
    // tslint:disable-next-line:prefer-function-over-method
    signTypedDataAsync(address, typedData) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(types_1.WalletSubproviderErrors.MethodNotSupported);
        });
    }
    _initialDerivedKeyInfoAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._initialDerivedKeyInfo) {
                return this._initialDerivedKeyInfo;
            }
            else {
                const parentKeyDerivationPath = `m/${this._privateKeyPath}`;
                const response = yield this._trezorConnectClientApi.getPublicKey({
                    path: parentKeyDerivationPath,
                });
                if (response.success) {
                    const payload = response.payload;
                    const hdKey = new HDNode();
                    hdKey.publicKey = new Buffer(payload.publicKey, 'hex');
                    hdKey.chainCode = new Buffer(payload.chainCode, 'hex');
                    const address = wallet_utils_1.walletUtils.addressOfHDKey(hdKey);
                    const initialDerivedKeyInfo = {
                        hdKey,
                        address,
                        derivationPath: parentKeyDerivationPath,
                        baseDerivationPath: this._privateKeyPath,
                    };
                    this._initialDerivedKeyInfo = initialDerivedKeyInfo;
                    return initialDerivedKeyInfo;
                }
                else {
                    const payload = response.payload;
                    throw new Error(payload.error);
                }
            }
        });
    }
    _findDerivedKeyInfoForAddress(initalHDKey, address) {
        const matchedDerivedKeyInfo = wallet_utils_1.walletUtils.findDerivedKeyInfoForAddressIfExists(address, initalHDKey, this._addressSearchLimit);
        if (matchedDerivedKeyInfo === undefined) {
            throw new Error(`${types_1.WalletSubproviderErrors.AddressNotFound}: ${address}`);
        }
        return matchedDerivedKeyInfo;
    }
}
exports.TrezorSubprovider = TrezorSubprovider;
//# sourceMappingURL=trezor.js.map