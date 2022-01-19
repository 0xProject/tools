import { assert } from '@0x/assert';
import { EIP712TypedData } from '@0x/types';
import { signTypedDataUtils } from '@0x/utils';
import { default as Common, Hardfork } from '@ethereumjs/common';
import * as ethjsTx from '@ethereumjs/tx';
import * as ethUtil from 'ethereumjs-util';
import * as _ from 'lodash';

import { PartialTxParams, WalletSubproviderErrors } from '../types';
import { getCommonForChain } from '../utils/chain_utils';

import { BaseWalletSubprovider } from './base_wallet_subprovider';

// tslint is so confused by this file for some reason
// tslint:disable: indent align

/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * This subprovider intercepts all account related RPC requests (e.g message/transaction signing, etc...) and handles
 * all requests with the supplied Ethereum private key.
 */
export class PrivateKeyWalletSubprovider extends BaseWalletSubprovider {
    private readonly _address: string;
    private readonly _privateKeyBuffer: Buffer;
    private readonly _common: Common;
    /**
     * Instantiates a PrivateKeyWalletSubprovider.
     * @param privateKey The corresponding private key to an Ethereum address
     * @param chainId The chain ID. Defaults to 1 (mainnet).
     * @return PrivateKeyWalletSubprovider instance
     */
    constructor(privateKey: string, chainId: number = 1, hardfork?: Hardfork) {
        assert.isString('privateKey', privateKey);
        super();
        this._privateKeyBuffer = Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex');
        this._address = `0x${ethUtil.privateToAddress(this._privateKeyBuffer).toString('hex')}`;
        this._common = getCommonForChain(chainId, hardfork);
    }
    /**
     * Retrieve the account associated with the supplied private key.
     * This method is implicitly called when issuing a `eth_accounts` JSON RPC request
     * via your providerEngine instance.
     * @return An array of accounts
     */
    public async getAccountsAsync(): Promise<string[]> {
        return [this._address];
    }
    /**
     * Sign a transaction with the private key. If you've added this Subprovider to your
     * app's provider, you can simply send an `eth_sendTransaction` JSON RPC request, and
     * this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    public async signTransactionAsync(txParams: PartialTxParams): Promise<string> {
        PrivateKeyWalletSubprovider._validateTxParams(txParams);
        if (txParams.from !== undefined && txParams.from.toLowerCase() !== this._address.toLowerCase()) {
            throw new Error(
                `Requested to sign transaction with address: ${txParams.from}, instantiated with address: ${this._address}`,
            );
        }
        const tx = createTransactionObject(this._common, txParams).sign(this._privateKeyBuffer);
        const rawTx = `0x${tx.serialize().toString('hex')}`;
        return rawTx;
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
    public async signPersonalMessageAsync(data: string, address: string): Promise<string> {
        if (data === undefined) {
            throw new Error(WalletSubproviderErrors.DataMissingForSignPersonalMessage);
        }
        assert.isHexString('data', data);
        assert.isETHAddressHex('address', address);
        if (address.toLowerCase() !== this._address.toLowerCase()) {
            throw new Error(
                `Requested to sign message with address: ${address}, instantiated with address: ${this._address}`,
            );
        }
        const dataBuff = ethUtil.toBuffer(data);
        const msgHashBuff = ethUtil.hashPersonalMessage(dataBuff);
        const sig = ethUtil.ecsign(msgHashBuff, this._privateKeyBuffer);
        const rpcSig = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
        return rpcSig;
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
    public async signTypedDataAsync(address: string, typedData: EIP712TypedData): Promise<string> {
        if (typedData === undefined) {
            throw new Error(WalletSubproviderErrors.DataMissingForSignTypedData);
        }
        assert.isETHAddressHex('address', address);
        if (address.toLowerCase() !== this._address.toLowerCase()) {
            throw new Error(
                `Requested to sign message with address: ${address}, instantiated with address: ${this._address}`,
            );
        }
        const dataBuff = signTypedDataUtils.generateTypedDataHash(typedData);
        const sig = ethUtil.ecsign(dataBuff, this._privateKeyBuffer);
        const rpcSig = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
        return rpcSig;
    }
}

/**
 * Create a transaction object based on the default network Common and transaction params.
 */
function createTransactionObject(
    common: Common,
    txParams: PartialTxParams,
): ethjsTx.Transaction | ethjsTx.FeeMarketEIP1559Transaction | ethjsTx.AccessListEIP2930Transaction {
    const normalizedTxParams = { ...txParams, gasLimit: txParams.gas };
    let effectiveHardfork = common.hardfork();
    // tslint:disable-next-line:custom-no-magic-numbers
    if (common.isActivatedEIP(1559)) {
        if (!normalizedTxParams.maxFeePerGas || !normalizedTxParams.maxPriorityFeePerGas) {
            // Use legacy transaction if neither new gas fields are present.
            effectiveHardfork = Hardfork.Berlin;
        }
    }
    let tx;
    if (effectiveHardfork === Hardfork.London) {
        const { gasPrice: _gasPrice, ...txWithoutGasPrice } = normalizedTxParams;
        tx = ethjsTx.FeeMarketEIP1559Transaction.fromTxData(txWithoutGasPrice, { common });
    } else if (effectiveHardfork === Hardfork.Berlin && normalizedTxParams.accessList) {
        tx = ethjsTx.AccessListEIP2930Transaction.fromTxData(normalizedTxParams, { common });
    } else {
        tx = ethjsTx.Transaction.fromTxData(normalizedTxParams, { common });
    }
    return tx;
}
