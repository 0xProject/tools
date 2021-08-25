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
exports.NonceSubproviderErrors = exports.TrezorSubprovider = exports.MetamaskSubprovider = exports.MnemonicWalletSubprovider = exports.PrivateKeyWalletSubprovider = exports.NonceTrackerSubprovider = exports.DebugSubprovider = exports.Subprovider = exports.GanacheSubprovider = exports.RPCSubprovider = exports.LedgerSubprovider = exports.RedundantSubprovider = exports.SignerSubprovider = exports.FakeGasEstimateSubprovider = exports.EmptyWalletSubprovider = exports.prependSubprovider = exports.ledgerEthereumBrowserClientFactoryAsync = void 0;
const hw_app_eth_1 = require("@ledgerhq/hw-app-eth");
// Ledger transports
const hw_transport_webusb_1 = require("@ledgerhq/hw-transport-webusb");
const hw_transport_webhid_1 = require("@ledgerhq/hw-transport-webhid");
exports.Web3ProviderEngine = require("web3-provider-engine");
/**
 * A factory method for creating a LedgerEthereumClient usable in a browser context.
 * @return LedgerEthereumClient A browser client for the LedgerSubprovider
 * @throws Error no transport available
 */
function ledgerEthereumBrowserClientFactoryAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        let ledgerConnection;
        if (yield hw_transport_webusb_1.default.isSupported()) {
            // Web USB is more stable and works with some issues on all platforms
            ledgerConnection = yield hw_transport_webusb_1.default.create();
        }
        else if (yield hw_transport_webhid_1.default.isSupported()) {
            // Web HID is experimental but works better on all platforms
            ledgerConnection = yield hw_transport_webhid_1.default.create();
        }
        // No transport available
        if (!ledgerConnection) {
            throw new Error("No supported transport available");
        }
        const ledgerEthClient = new hw_app_eth_1.default(ledgerConnection);
        return ledgerEthClient;
    });
}
exports.ledgerEthereumBrowserClientFactoryAsync = ledgerEthereumBrowserClientFactoryAsync;
var subprovider_utils_1 = require("./utils/subprovider_utils");
Object.defineProperty(exports, "prependSubprovider", { enumerable: true, get: function () { return subprovider_utils_1.prependSubprovider; } });
var empty_wallet_subprovider_1 = require("./subproviders/empty_wallet_subprovider");
Object.defineProperty(exports, "EmptyWalletSubprovider", { enumerable: true, get: function () { return empty_wallet_subprovider_1.EmptyWalletSubprovider; } });
var fake_gas_estimate_subprovider_1 = require("./subproviders/fake_gas_estimate_subprovider");
Object.defineProperty(exports, "FakeGasEstimateSubprovider", { enumerable: true, get: function () { return fake_gas_estimate_subprovider_1.FakeGasEstimateSubprovider; } });
var signer_1 = require("./subproviders/signer");
Object.defineProperty(exports, "SignerSubprovider", { enumerable: true, get: function () { return signer_1.SignerSubprovider; } });
var redundant_subprovider_1 = require("./subproviders/redundant_subprovider");
Object.defineProperty(exports, "RedundantSubprovider", { enumerable: true, get: function () { return redundant_subprovider_1.RedundantSubprovider; } });
var ledger_1 = require("./subproviders/ledger");
Object.defineProperty(exports, "LedgerSubprovider", { enumerable: true, get: function () { return ledger_1.LedgerSubprovider; } });
var rpc_subprovider_1 = require("./subproviders/rpc_subprovider");
Object.defineProperty(exports, "RPCSubprovider", { enumerable: true, get: function () { return rpc_subprovider_1.RPCSubprovider; } });
var ganache_1 = require("./subproviders/ganache");
Object.defineProperty(exports, "GanacheSubprovider", { enumerable: true, get: function () { return ganache_1.GanacheSubprovider; } });
var subprovider_1 = require("./subproviders/subprovider");
Object.defineProperty(exports, "Subprovider", { enumerable: true, get: function () { return subprovider_1.Subprovider; } });
var debug_subprovider_1 = require("./subproviders/debug_subprovider");
Object.defineProperty(exports, "DebugSubprovider", { enumerable: true, get: function () { return debug_subprovider_1.DebugSubprovider; } });
var nonce_tracker_1 = require("./subproviders/nonce_tracker");
Object.defineProperty(exports, "NonceTrackerSubprovider", { enumerable: true, get: function () { return nonce_tracker_1.NonceTrackerSubprovider; } });
var private_key_wallet_1 = require("./subproviders/private_key_wallet");
Object.defineProperty(exports, "PrivateKeyWalletSubprovider", { enumerable: true, get: function () { return private_key_wallet_1.PrivateKeyWalletSubprovider; } });
var mnemonic_wallet_1 = require("./subproviders/mnemonic_wallet");
Object.defineProperty(exports, "MnemonicWalletSubprovider", { enumerable: true, get: function () { return mnemonic_wallet_1.MnemonicWalletSubprovider; } });
var metamask_subprovider_1 = require("./subproviders/metamask_subprovider");
Object.defineProperty(exports, "MetamaskSubprovider", { enumerable: true, get: function () { return metamask_subprovider_1.MetamaskSubprovider; } });
var trezor_1 = require("./subproviders/trezor");
Object.defineProperty(exports, "TrezorSubprovider", { enumerable: true, get: function () { return trezor_1.TrezorSubprovider; } });
var types_1 = require("./types");
Object.defineProperty(exports, "NonceSubproviderErrors", { enumerable: true, get: function () { return types_1.NonceSubproviderErrors; } });
//# sourceMappingURL=index.js.map