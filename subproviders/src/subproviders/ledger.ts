import { assert } from '@0x/assert';
import { addressUtils } from '@0x/utils';
import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import ethUtil = require('ethereumjs-util');
import HDNode = require('hdkey');
import * as _ from 'lodash';
import { Lock } from 'semaphore-async-await';

import {
    DerivedHDKeyInfo,
    LedgerEthereumClient,
    LedgerEthereumClientFactoryAsync,
    LedgerSubproviderConfigs,
    LedgerSubproviderErrors,
    PartialTxParams,
    WalletSubproviderErrors,
} from '../types';
import { walletUtils } from '../utils/wallet_utils';

import { BaseWalletSubprovider } from './base_wallet_subprovider';

const LEDGER_LEGACY_DERIVATION_PATH = `m/44'/60'/0'/0/x`
const LEDGER_LIVE_DERIVATION_PATH = `m/44'/60'/x'/0/0`

const DEFAULT_BASE_DERIVATION_PATH = LEDGER_LEGACY_DERIVATION_PATH;
const ASK_FOR_ON_DEVICE_CONFIRMATION = false;
const SHOULD_GET_CHAIN_CODE = true;
const DEFAULT_NUM_ADDRESSES_TO_FETCH = 10;
const DEFAULT_ADDRESS_SEARCH_LIMIT = 1000;

/*
class LedgerDerivedHDKeyInfoIterator implements AsyncIterableIterator<DerivedHDKeyInfo> {
    constructor(
        private readonly initialDerivedKey: DerivedHDKeyInfo, 
        private readonly ledgerClient: LedgerEthereumClient,
        private readonly searchLimit: number = DEFAULT_ADDRESS_SEARCH_LIMIT,
        private index = 0,
    ) {}

    public async next(): Promise<IteratorResult<DerivedHDKeyInfo, any>> {
        const path = `m/${this.index}`;

        const hdKey = this.initialDerivedKey.hdKey.derive(path);

        const derivedKey = {
            address,
            hdKey,
            baseDerivationPath,
            derivationPath: fullDerivationPath,
        };

        const isDone = this.index === this.searchLimit;

        this.index++;

        return {
            done: isDone,
            value: derivedKey,
        };
    }
}
*/

/**
 * Subprovider for interfacing with a user's [Ledger Nano S](https://www.ledgerwallet.com/products/ledger-nano-s).
 * This subprovider intercepts all account related RPC requests (e.g message/transaction signing, etc...) and
 * re-routes them to a Ledger device plugged into the users computer.
 */
export class LedgerSubprovider extends BaseWalletSubprovider {
    // tslint:disable-next-line:no-unused-variable
    private readonly _connectionLock = new Lock();
    private readonly _networkId: number;
    private _baseDerivationPath: string;
    private readonly _ledgerEthereumClientFactoryAsync: LedgerEthereumClientFactoryAsync;
    private _ledgerClientIfExists?: LedgerEthereumClient;
    private readonly _shouldAlwaysAskForConfirmation: boolean;
    private readonly _addressSearchLimit: number;
    private readonly _common: Common;
    /**
     * Instantiates a LedgerSubprovider. Defaults to derivationPath set to `44'/60'/0'`.
     * TestRPC/Ganache defaults to `m/44'/60'/0'/0`, so set this in the configs if desired.
     * @param config Several available configurations
     * @return LedgerSubprovider instance
     */
    constructor(config: LedgerSubproviderConfigs) {
        super();
        this._networkId = config.networkId;
        this._ledgerEthereumClientFactoryAsync = config.ledgerEthereumClientFactoryAsync;
        this._baseDerivationPath = config.baseDerivationPath || DEFAULT_BASE_DERIVATION_PATH;
        this._shouldAlwaysAskForConfirmation =
            config.accountFetchingConfigs !== undefined &&
            config.accountFetchingConfigs.shouldAskForOnDeviceConfirmation !== undefined
                ? config.accountFetchingConfigs.shouldAskForOnDeviceConfirmation
                : ASK_FOR_ON_DEVICE_CONFIRMATION;
        this._addressSearchLimit =
            config.accountFetchingConfigs !== undefined &&
            config.accountFetchingConfigs.addressSearchLimit !== undefined
                ? config.accountFetchingConfigs.addressSearchLimit
                : DEFAULT_ADDRESS_SEARCH_LIMIT;
        this._common = Common.custom({ name: 'mainnet', chainId: this._networkId });
    }
    /**
     * Retrieve the set derivation path
     * @returns derivation path
     */
    public getPath(): string {
        return this._baseDerivationPath;
    }
    /**
     * Set a desired derivation path when computing the available user addresses
     * @param basDerivationPath The desired derivation path (e.g `44'/60'/0'`)
     */
    public setPath(basDerivationPath: string): void {
        this._baseDerivationPath = basDerivationPath;
    }
    /**
     * Retrieve a users Ledger accounts. The accounts are derived from the derivationPath,
     * master public key and chain code. Because of this, you can request as many accounts
     * as you wish and it only requires a single request to the Ledger device. This method
     * is automatically called when issuing a `eth_accounts` JSON RPC request via your providerEngine
     * instance.
     * @param numberOfAccounts Number of accounts to retrieve (default: 10)
     * @return An array of accounts
     */
    public async getAccountsAsync(numberOfAccounts: number = DEFAULT_NUM_ADDRESSES_TO_FETCH): Promise<string[]> {
        const initialDerivedKeyInfo = await this._initialDerivedKeyInfoAsync();

        const derivedKeyInfos = walletUtils.calculateDerivedHDKeyInfos(initialDerivedKeyInfo, numberOfAccounts);

        const accounts = [];
        
        try {
            for (let index = 0; index < numberOfAccounts; index++) {
                const account = await this._getDerivedHDKeyInfo(this._baseDerivationPath.replace("x", index.toString(10)))
                accounts.push(account);
            }
        } catch (error) {
            console.error(error);
        }
        
        return accounts.map(({address}) => address);
        // const accounts = _.map(derivedKeyInfos, k => k.address);
        // return accounts;
    }
    /**
     * Signs a transaction on the Ledger with the account specificed by the `from` field in txParams.
     * If you've added the LedgerSubprovider to your app's provider, you can simply send an `eth_sendTransaction`
     * JSON RPC request, and this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    public async signTransactionAsync(txParams: PartialTxParams): Promise<string> {
        LedgerSubprovider._validateTxParams(txParams);
        if (txParams.from === undefined || !addressUtils.isAddress(txParams.from)) {
            throw new Error(WalletSubproviderErrors.FromAddressMissingOrInvalid);
        }
        // omit some properties from txParams.
        const _txParams = {
            to: txParams.to,
            gasLimit: txParams.gas,
            gasPrice: txParams.gasPrice,
            data: txParams.data,
            nonce: txParams.nonce,
            value: txParams.value,
        };
        const initialDerivedKeyInfo = await this._initialDerivedKeyInfoAsync();
        const derivedKeyInfo = await this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, txParams.from);

        this._ledgerClientIfExists = await this._createLedgerClientAsync();

        const ledgerTxHex = (() => {
            const values = Transaction.fromTxData(_txParams, { common: this._common }).raw();
            // tslint:disable-next-line: custom-no-magic-numbers
            values[6] = ethUtil.bnToUnpaddedBuffer(new ethUtil.BN(this._networkId));
            return ethUtil.rlp.encode(values).toString('hex');
        })();
        try {
            const fullDerivationPath = derivedKeyInfo.derivationPath;
            const result = await this._ledgerClientIfExists.signTransaction(fullDerivationPath, ledgerTxHex);
            const signedTx = Transaction.fromTxData(
                {
                    ..._txParams,
                    r: `0x${result.r}`,
                    s: `0x${result.s}`,
                    v: `0x${result.v}`,
                },
                { common: this._common },
            );
            // EIP155: v should be chain_id * 2 + {35, 36}
            const eip55Constant = 35;
            const signedChainId = Math.floor((ethUtil.toBuffer(signedTx.v)[0] - eip55Constant) / 2);
            if (signedChainId !== this._networkId) {
                await this._destroyLedgerClientAsync();
                const err = new Error(LedgerSubproviderErrors.TooOldLedgerFirmware);
                throw err;
            }

            const signedTxHex = `0x${signedTx.serialize().toString('hex')}`;
            await this._destroyLedgerClientAsync();
            return signedTxHex;
        } catch (err) {
            await this._destroyLedgerClientAsync();
            throw err;
        }
    }
    /**
     * Sign a personal Ethereum signed message. The signing account will be the account
     * associated with the provided address.
     * The Ledger adds the Ethereum signed message prefix on-device.  If you've added
     * the LedgerSubprovider to your app's provider, you can simply send an `eth_sign`
     * or `personal_sign` JSON RPC request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param data Hex string message to sign
     * @param address Address of the account to sign with
     * @return Signature hex string (order: rsv)
     */
    public async signPersonalMessageAsync(data: string, address: string): Promise<string> {
        if (data === undefined) {
            throw new Error(WalletSubproviderErrors.DataMissingForSignPersonalMessage);
        }
        assert.isHexString('data', data);
        assert.isETHAddressHex('address', address);
        const initialDerivedKeyInfo = await this._initialDerivedKeyInfoAsync();
        const derivedKeyInfo = await this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, address);

        this._ledgerClientIfExists = await this._createLedgerClientAsync();
        try {
            const fullDerivationPath = derivedKeyInfo.derivationPath;
            const result = await this._ledgerClientIfExists.signPersonalMessage(
                fullDerivationPath,
                ethUtil.stripHexPrefix(data),
            );
            const hexBase = 16;
            let vHex = result.v.toString(hexBase);
            if (vHex.length < 2) {
                vHex = `0${vHex}`;
            }
            const signature = `0x${result.r}${result.s}${vHex}`;
            await this._destroyLedgerClientAsync();
            return signature;
        } catch (err) {
            await this._destroyLedgerClientAsync();
            throw err;
        }
    }
    /**
     * eth_signTypedData is currently not supported on Ledger devices.
     * @param address Address of the account to sign with
     * @param data the typed data object
     * @return Signature hex string (order: rsv)
     */
    // tslint:disable-next-line:prefer-function-over-method
    public async signTypedDataAsync(address: string, typedData: any): Promise<string> {
        throw new Error(WalletSubproviderErrors.MethodNotSupported);
    }
    private async _createLedgerClientAsync(): Promise<LedgerEthereumClient> {
        await this._connectionLock.acquire();
        if (this._ledgerClientIfExists !== undefined) {
            this._connectionLock.release();
            throw new Error(LedgerSubproviderErrors.MultipleOpenConnectionsDisallowed);
        }
        const ledgerEthereumClient = await this._ledgerEthereumClientFactoryAsync();
        this._connectionLock.release();
        return ledgerEthereumClient;
    }
    private async _destroyLedgerClientAsync(): Promise<void> {
        await this._connectionLock.acquire();
        if (this._ledgerClientIfExists === undefined) {
            this._connectionLock.release();
            return;
        }
        await this._ledgerClientIfExists.transport.close();
        this._ledgerClientIfExists = undefined;
        this._connectionLock.release();
    }

    private async _getDerivedHDKeyInfo(derivationPath: string): Promise<DerivedHDKeyInfo> {
        this._ledgerClientIfExists = await this._createLedgerClientAsync();
        let ledgerResponse;
        try {
            ledgerResponse = await this._ledgerClientIfExists.getAddress(
                derivationPath,
                this._shouldAlwaysAskForConfirmation,
                SHOULD_GET_CHAIN_CODE,
            );
        } finally {
            await this._destroyLedgerClientAsync();
        }

        const hdKey = new HDNode();
        hdKey.publicKey = Buffer.from(ledgerResponse.publicKey, 'hex');
        hdKey.chainCode = Buffer.from(ledgerResponse?.chainCode ?? "", 'hex');
        const address = walletUtils.addressOfHDKey(hdKey);

        const derivedHDKeyInfo = {
            hdKey,
            address,
            derivationPath,
            baseDerivationPath: this._baseDerivationPath,
        };
        return derivedHDKeyInfo;
    }

    private async _initialDerivedKeyInfoAsync(): Promise<DerivedHDKeyInfo> {
        // const parentKeyDerivationPath = `m/${this._baseDerivationPath}`;
        let parentKeyDerivationPath;
        if (this._baseDerivationPath.includes("x")) {
            parentKeyDerivationPath = this._baseDerivationPath.replace("x", "0");
        } else {
            // "legacy"
            parentKeyDerivationPath = `m/${this._baseDerivationPath}`;
        }
        return await this._getDerivedHDKeyInfo(parentKeyDerivationPath);
    }

    private async _findDerivedKeyInfoForAddress(initalHDKey: DerivedHDKeyInfo, address: string): Promise<DerivedHDKeyInfo> {
        let found = false;
        let index = 0;
        let matchedDerivedKeyInfo;
        const { baseDerivationPath } = initalHDKey;

        while (!found && index < this._addressSearchLimit) {
            let parentKeyDerivationPath;
            if (baseDerivationPath.includes("x")) {
                parentKeyDerivationPath = baseDerivationPath.replace("x", index.toString(10));
            } else {
                parentKeyDerivationPath = `m/${baseDerivationPath}`;
            }
            const derivedHDKeyInfo = await this._getDerivedHDKeyInfo(parentKeyDerivationPath);
            
            if (derivedHDKeyInfo.address.toLowerCase() === address.toLowerCase()) {
                found = true;
                matchedDerivedKeyInfo = derivedHDKeyInfo;
            }
            index++;
        }

        // const matchedDerivedKeyInfo = walletUtils.findDerivedKeyInfoForAddressIfExists(
        //     address,
        //     initalHDKey,
        //     10 || this._addressSearchLimit,
        // );

        if (matchedDerivedKeyInfo === undefined) {
            throw new Error(`${WalletSubproviderErrors.AddressNotFound}: ${address}`);
        }

        return matchedDerivedKeyInfo;
    }
}
