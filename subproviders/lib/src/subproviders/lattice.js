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
exports.LatticeSubprovider = void 0;
const assert_1 = require("@0x/assert");
const utils_1 = require("@0x/utils");
const tx_1 = require("@ethereumjs/tx");
const types_1 = require("../types");
const base_wallet_subprovider_1 = require("./base_wallet_subprovider");
const DEFAULT_NUM_ADDRESSES_TO_FETCH = 1;
const MAINNET_ID = 1;
const ROPSTEN_ID = 3;
const RINKEBY_ID = 4;
const KOVAN_ID = 42;
const GOERLI_ID = 6284;
// Get the network name given an ID. This network is only used for connecting to
// the Lattice. Generally, `mainnet` corresponds to a production Lattice
function getNetwork(networkId) {
    switch (networkId) {
        // Only known testnet IDs can be used to find development Lattices.
        case ROPSTEN_ID:
        case RINKEBY_ID:
        case KOVAN_ID:
        case GOERLI_ID:
            return 'testnet';
        // Mainnet and all custom chainIDs are used to find production Lattices.
        case MAINNET_ID:
        default:
            return 'mainnet';
    }
}
class LatticeSubprovider extends base_wallet_subprovider_1.BaseWalletSubprovider {
    /**
     * Instantiates a LatticeSubprovider. Private key path is set to `44'/60'/0'/0/`.
     * This subprovider must be initialized with the GridPlus `eth-lattice-keyring` module as
     * the `config.latticeConnectClient` object: https://www.npmjs.com/package/eth-lattice-keyring
     */
    constructor(config) {
        super();
        const opts = {
            name: config.appName,
            network: getNetwork(config.networkId),
        };
        this._latticeConnectClient = new config.latticeConnectClient(opts);
    }
    /**
     * Fetches the current Lattice wallet Ethereum address at path `44'/60'/0'/0/0`. Only the 0-th index address
     * may be fetched, but the Lattice user may switch wallets on their device at any time, in which case this
     * function would return a new address (in the form of a 1-element string array).
     * @param numberOfAccounts number of accounts to fetch. Currently this is ignored in the connect client, as only one address may be fetched at a time
     * @return A one-element array of addresses representing the current Lattice wallet's Ethereum account.
     */
    getAccountsAsync(numberOfAccounts = DEFAULT_NUM_ADDRESSES_TO_FETCH) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accounts = yield this._latticeConnectClient.addAccounts(numberOfAccounts);
                return accounts;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Signs a transaction from the account specified by the `from` field in txParams.
     * @param txParams Parameters of the transaction to sign.
     * @return Signed transaction hex string. This is a serialized `ethereum-tx` Transaction object.
     */
    signTransactionAsync(txData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (txData.from === undefined || !utils_1.addressUtils.isAddress(txData.from)) {
                throw new Error(types_1.WalletSubproviderErrors.FromAddressMissingOrInvalid);
            }
            const txReq = tx_1.TransactionFactory.fromTxData(txData);
            try {
                const signedTx = yield this._latticeConnectClient.signTransaction(txData.from, txReq);
                return `0x${signedTx.serialize().toString('hex')}`;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Sign a personal Ethereum message from the account specified in the `address` param.
     * @param data Data to be signed. May be represented in hex or ASCII; this representation will be preserved.
     * @param address Address from which to sign. Must be the address at `m/44'/60'/0'/0/0` of the current wallet.
     * @return Signature hex string of form `0x{r}{s}{v}
     */
    signPersonalMessageAsync(data, address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data === undefined) {
                throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignPersonalMessage);
            }
            assert_1.assert.isHexString('data', data);
            assert_1.assert.isETHAddressHex('address', address);
            try {
                const sig = yield this._latticeConnectClient.signPersonalMessage(address, data);
                return sig;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Sign a typed data message from the account specified in the `address` param.
     * @param address Address from which to sign. Must be the address at `m/44'/60'/0'/0/0` of the current wallet.
     * @param typedData The data to be signed.
     * @return Signature hex string of form `0x{r}{s}{v}
     */
    signTypedDataAsync(address, typedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typedData === undefined) {
                throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignTypedData);
            }
            assert_1.assert.isETHAddressHex('address', address);
            try {
                const data = {
                    protocol: 'eip712',
                    payload: typedData,
                };
                const sig = yield this._latticeConnectClient.signMessage(address, data);
                return sig;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.LatticeSubprovider = LatticeSubprovider;
//# sourceMappingURL=lattice.js.map