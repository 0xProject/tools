import * as _ from 'lodash';

import { AccessListEIP2930Transaction, Transaction, TransactionFactory } from '@ethereumjs/tx';
import { BlockParamLiteral, JSONRPCRequestPayload } from 'ethereum-types';
import ethUtil = require('ethereumjs-util');
import providerEngineUtils = require('web3-provider-engine/util/rpc-cache-utils');

import { Callback, ErrorCallback, NextCallback, NonceSubproviderErrors } from '../types';

import { Subprovider } from './subprovider';

const NONCE_TOO_LOW_ERROR_MESSAGE = 'Transaction nonce is too low';

/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It is heavily inspired by the [NonceSubprovider](https://github.com/MetaMask/provider-engine/blob/master/subproviders/nonce-tracker.js).
 * We added the additional feature of clearing the cached nonce value when a `nonce value too low` error occurs.
 */
export class NonceTrackerSubprovider extends Subprovider {
    private readonly _nonceCache: { [address: string]: string } = {};
    private static _reconstructTransaction(payload: JSONRPCRequestPayload): Transaction | AccessListEIP2930Transaction {
        const raw = payload.params[0];
        if (raw === undefined) {
            throw new Error(NonceSubproviderErrors.EmptyParametersFound);
        }
        const rawData = ethUtil.toBuffer(raw);
        return TransactionFactory.fromSerializedData(rawData);
    }
    private static _determineAddress(payload: JSONRPCRequestPayload): string {
        let address: string;
        switch (payload.method) {
            case 'eth_getTransactionCount':
                address = payload.params[0].toLowerCase();
                return address;
            case 'eth_sendRawTransaction':
                const transaction = NonceTrackerSubprovider._reconstructTransaction(payload);
                return transaction
                    .getSenderAddress()
                    .toString()
                    .toLowerCase();
            default:
                throw new Error(NonceSubproviderErrors.CannotDetermineAddressFromPayload);
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
    public async handleRequest(payload: JSONRPCRequestPayload, next: NextCallback, end: ErrorCallback): Promise<void> {
        switch (payload.method) {
            case 'eth_getTransactionCount':
                const requestDefaultBlock = providerEngineUtils.blockTagForPayload(payload);
                if (requestDefaultBlock === BlockParamLiteral.Pending) {
                    const address = NonceTrackerSubprovider._determineAddress(payload);
                    const cachedResult = this._nonceCache[address];
                    if (cachedResult !== undefined) {
                        return end(null, cachedResult);
                    } else {
                        return next((requestError: Error | null, requestResult: any, cb: Callback) => {
                            if (requestError === null) {
                                this._nonceCache[address] = requestResult as string;
                            }
                            cb();
                        });
                    }
                } else {
                    return next();
                }
            case 'eth_sendRawTransaction':
                return next((sendTransactionError: Error | null, _txResult: any, cb: Callback) => {
                    if (sendTransactionError === null) {
                        this._handleSuccessfulTransaction(payload);
                    } else {
                        this._handleSendTransactionError(payload, sendTransactionError);
                    }
                    cb();
                });
            default:
                return next();
        }
    }
    private _handleSuccessfulTransaction(payload: JSONRPCRequestPayload): void {
        const address = NonceTrackerSubprovider._determineAddress(payload);
        const transaction = NonceTrackerSubprovider._reconstructTransaction(payload);
        // Increment the nonce from the previous successfully submitted transaction
        let nonce = ethUtil.bufferToInt(transaction.nonce);
        nonce++;
        const hexBase = 16;
        let nextHexNonce = nonce.toString(hexBase);
        if (nextHexNonce.length % 2) {
            nextHexNonce = `0${nextHexNonce}`;
        }
        const nextPrefixedHexNonce = `0x${nextHexNonce}`;
        this._nonceCache[address] = nextPrefixedHexNonce;
    }
    private _handleSendTransactionError(payload: JSONRPCRequestPayload, err: Error): void {
        const address = NonceTrackerSubprovider._determineAddress(payload);
        if (this._nonceCache[address] && _.includes(err.message, NONCE_TOO_LOW_ERROR_MESSAGE)) {
            delete this._nonceCache[address];
        }
    }
}
