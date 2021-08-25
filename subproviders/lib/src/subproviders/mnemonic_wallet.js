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
exports.MnemonicWalletSubprovider = void 0;
const assert_1 = require("@0x/assert");
const utils_1 = require("@0x/utils");
const bip39 = require("bip39");
const HDNode = require("hdkey");
const _ = require("lodash");
const types_1 = require("../types");
const wallet_utils_1 = require("../utils/wallet_utils");
const base_wallet_subprovider_1 = require("./base_wallet_subprovider");
const private_key_wallet_1 = require("./private_key_wallet");
const DEFAULT_BASE_DERIVATION_PATH = `44'/60'/0'/0`;
const DEFAULT_NUM_ADDRESSES_TO_FETCH = 10;
const DEFAULT_ADDRESS_SEARCH_LIMIT = 1000;
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * This subprovider intercepts all account related RPC requests (e.g message/transaction signing, etc...) and handles
 * all requests with accounts derived from the supplied mnemonic.
 */
class MnemonicWalletSubprovider extends base_wallet_subprovider_1.BaseWalletSubprovider {
    /**
     * Instantiates a MnemonicWalletSubprovider. Defaults to baseDerivationPath set to `44'/60'/0'/0`.
     * This is the default in TestRPC/Ganache, it can be overridden if desired.
     * @param config Configuration for the mnemonic wallet, must contain the mnemonic
     * @return MnemonicWalletSubprovider instance
     */
    constructor(config) {
        assert_1.assert.isString('mnemonic', config.mnemonic);
        const baseDerivationPath = config.baseDerivationPath || DEFAULT_BASE_DERIVATION_PATH;
        assert_1.assert.isString('baseDerivationPath', baseDerivationPath);
        const addressSearchLimit = config.addressSearchLimit || DEFAULT_ADDRESS_SEARCH_LIMIT;
        assert_1.assert.isNumber('addressSearchLimit', addressSearchLimit);
        super();
        this._mnemonic = config.mnemonic;
        this._baseDerivationPath = baseDerivationPath;
        this._addressSearchLimit = addressSearchLimit;
        this._derivedKeyInfo = this._initialDerivedKeyInfo(this._baseDerivationPath);
        this.chainId = config.chainId || 1;
        this.hardfork = config.hardfork;
    }
    /**
     * Retrieve the set derivation path
     * @returns derivation path
     */
    getPath() {
        return this._baseDerivationPath;
    }
    /**
     * Set a desired derivation path when computing the available user addresses
     * @param baseDerivationPath The desired derivation path (e.g `44'/60'/0'`)
     */
    setPath(baseDerivationPath) {
        this._baseDerivationPath = baseDerivationPath;
        this._derivedKeyInfo = this._initialDerivedKeyInfo(this._baseDerivationPath);
    }
    /**
     * Retrieve the accounts associated with the mnemonic.
     * This method is implicitly called when issuing a `eth_accounts` JSON RPC request
     * via your providerEngine instance.
     * @param numberOfAccounts Number of accounts to retrieve (default: 10)
     * @return An array of accounts
     */
    getAccountsAsync(numberOfAccounts = DEFAULT_NUM_ADDRESSES_TO_FETCH) {
        return __awaiter(this, void 0, void 0, function* () {
            const derivedKeys = wallet_utils_1.walletUtils.calculateDerivedHDKeyInfos(this._derivedKeyInfo, numberOfAccounts);
            const accounts = _.map(derivedKeys, k => k.address);
            return accounts;
        });
    }
    /**
     * Signs a transaction with the account specificed by the `from` field in txParams.
     * If you've added this Subprovider to your  app's provider, you can simply send
     * an `eth_sendTransaction` JSON RPC request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    signTransactionAsync(txParams) {
        return __awaiter(this, void 0, void 0, function* () {
            if (txParams.from === undefined || !utils_1.addressUtils.isAddress(txParams.from)) {
                throw new Error(types_1.WalletSubproviderErrors.FromAddressMissingOrInvalid);
            }
            const privateKeyWallet = this._privateKeyWalletForAddress(txParams.from);
            const signedTx = privateKeyWallet.signTransactionAsync(txParams);
            return signedTx;
        });
    }
    /**
     * Sign a personal Ethereum signed message. The signing account will be the account
     * associated with the provided address. If you've added the MnemonicWalletSubprovider to
     * your app's provider, you can simply send an `eth_sign` or `personal_sign` JSON RPC request,
     * and this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
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
            const privateKeyWallet = this._privateKeyWalletForAddress(address);
            const sig = yield privateKeyWallet.signPersonalMessageAsync(data, address);
            return sig;
        });
    }
    /**
     * Sign an EIP712 Typed Data message. The signing account will be the account
     * associated with the provided address. If you've added this MnemonicWalletSubprovider to
     * your app's provider, you can simply send an `eth_signTypedData` JSON RPC request, and
     * this method will be called auto-magically. If you are not using this via a ProviderEngine
     *  instance, you can call it directly.
     * @param address Address of the account to sign with
     * @param data the typed data object
     * @return Signature hex string (order: rsv)
     */
    signTypedDataAsync(address, typedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typedData === undefined) {
                throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignPersonalMessage);
            }
            assert_1.assert.isETHAddressHex('address', address);
            const privateKeyWallet = this._privateKeyWalletForAddress(address);
            const sig = yield privateKeyWallet.signTypedDataAsync(address, typedData);
            return sig;
        });
    }
    _privateKeyWalletForAddress(address) {
        const derivedKeyInfo = this._findDerivedKeyInfoForAddress(address);
        const privateKeyHex = derivedKeyInfo.hdKey.privateKey.toString('hex');
        const privateKeyWallet = new private_key_wallet_1.PrivateKeyWalletSubprovider(privateKeyHex, this.chainId, this.hardfork);
        return privateKeyWallet;
    }
    _findDerivedKeyInfoForAddress(address) {
        const matchedDerivedKeyInfo = wallet_utils_1.walletUtils.findDerivedKeyInfoForAddressIfExists(address, this._derivedKeyInfo, this._addressSearchLimit);
        if (matchedDerivedKeyInfo === undefined) {
            throw new Error(`${types_1.WalletSubproviderErrors.AddressNotFound}: ${address}`);
        }
        return matchedDerivedKeyInfo;
    }
    _initialDerivedKeyInfo(baseDerivationPath) {
        const seed = bip39.mnemonicToSeedSync(this._mnemonic);
        const hdKey = HDNode.fromMasterSeed(seed);
        // Walk down to base derivation level (i.e m/44'/60'/0') and create an initial key at that level
        // all children will then be walked relative (i.e m/0)
        const parentKeyDerivationPath = `m/${baseDerivationPath}`;
        const parentHDKeyAtDerivationPath = hdKey.derive(parentKeyDerivationPath);
        const address = wallet_utils_1.walletUtils.addressOfHDKey(parentHDKeyAtDerivationPath);
        const derivedKeyInfo = {
            address,
            baseDerivationPath,
            derivationPath: parentKeyDerivationPath,
            hdKey: parentHDKeyAtDerivationPath,
        };
        return derivedKeyInfo;
    }
}
exports.MnemonicWalletSubprovider = MnemonicWalletSubprovider;
//# sourceMappingURL=mnemonic_wallet.js.map