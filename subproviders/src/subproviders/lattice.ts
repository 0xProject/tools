import { assert } from '@0x/assert';
import { addressUtils } from '@0x/utils';
import { TransactionFactory } from '@ethereumjs/tx';
import * as _ from 'lodash';

import { LatticeSubproviderConfig, PartialTxParams, WalletSubproviderErrors } from '../types';

import { BaseWalletSubprovider } from './base_wallet_subprovider';

const DEFAULT_NUM_ADDRESSES_TO_FETCH = 1;
const MAINNET_ID = 1;
const ROPSTEN_ID = 3;
const RINKEBY_ID = 4;
const KOVAN_ID = 42;
const GOERLI_ID = 6284;

// Get the network name given an ID. This network is only used for connecting to
// the Lattice. Generally, `mainnet` corresponds to a production Lattice
function getNetwork(networkId: number): string {
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

export class LatticeSubprovider extends BaseWalletSubprovider {
    private readonly _latticeConnectClient: any;
    /**
     * Instantiates a LatticeSubprovider. Private key path is set to `44'/60'/0'/0/`.
     * This subprovider must be initialized with the GridPlus `eth-lattice-keyring` module as
     * the `config.latticeConnectClient` object: https://www.npmjs.com/package/eth-lattice-keyring
     */
    constructor(config: LatticeSubproviderConfig) {
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
    public async getAccountsAsync(numberOfAccounts: number = DEFAULT_NUM_ADDRESSES_TO_FETCH): Promise<string[]> {
        try {
            const accounts = await this._latticeConnectClient.addAccounts(numberOfAccounts);
            return accounts;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Signs a transaction from the account specified by the `from` field in txParams.
     * @param txParams Parameters of the transaction to sign.
     * @return Signed transaction hex string. This is a serialized `ethereum-tx` Transaction object.
     */
    public async signTransactionAsync(txData: PartialTxParams): Promise<string> {
        if (txData.from === undefined || !addressUtils.isAddress(txData.from)) {
            throw new Error(WalletSubproviderErrors.FromAddressMissingOrInvalid);
        }
        const txReq = TransactionFactory.fromTxData(txData);
        try {
            const signedTx = await this._latticeConnectClient.signTransaction(txData.from, txReq);
            return `0x${signedTx.serialize().toString('hex')}`;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Sign a personal Ethereum message from the account specified in the `address` param.
     * @param data Data to be signed. May be represented in hex or ASCII; this representation will be preserved.
     * @param address Address from which to sign. Must be the address at `m/44'/60'/0'/0/0` of the current wallet.
     * @return Signature hex string of form `0x{r}{s}{v}
     */
    public async signPersonalMessageAsync(data: string, address: string): Promise<string> {
        if (data === undefined) {
            throw new Error(WalletSubproviderErrors.DataMissingForSignPersonalMessage);
        }
        assert.isHexString('data', data);
        assert.isETHAddressHex('address', address);
        try {
            const sig = await this._latticeConnectClient.signPersonalMessage(address, data);
            return sig;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Sign a typed data message from the account specified in the `address` param.
     * @param address Address from which to sign. Must be the address at `m/44'/60'/0'/0/0` of the current wallet.
     * @param typedData The data to be signed.
     * @return Signature hex string of form `0x{r}{s}{v}
     */
    public async signTypedDataAsync(address: string, typedData: any): Promise<string> {
        if (typedData === undefined) {
            throw new Error(WalletSubproviderErrors.DataMissingForSignTypedData);
        }
        assert.isETHAddressHex('address', address);
        try {
            const data = {
                protocol: 'eip712',
                payload: typedData,
            };
            const sig = await this._latticeConnectClient.signMessage(address, data);
            return sig;
        } catch (err) {
            throw err;
        }
    }
}
