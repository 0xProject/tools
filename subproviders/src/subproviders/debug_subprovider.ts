import { BigNumber } from '@0x/utils';
import { TransactionFactory, TypedTransaction, FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { JSONRPCRequestPayload } from 'ethereum-types';
import { toBuffer } from 'ethereumjs-util';

import { Callback, ErrorCallback } from '../types';

import { Subprovider } from './subprovider';

const HEX_BASE = 16;

export interface DebugPayloadRawTransactionAttributes {
    gasPrice: string;
    gasLimit: string;
    nonce: string;
    value: string;
    to: string;
}
export interface DebugPayload extends JSONRPCRequestPayload {
    rawTransactionAttributes?: DebugPayloadRawTransactionAttributes;
}

export type WithDebugPayload = (debugPayload: DebugPayload) => void;
// tslint:disable-next-line:no-console
const defaultDebugCallback = (debugPayload: DebugPayload) => console.debug(JSON.stringify(debugPayload, null, 2));

/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * For every request, a object for debugging will be sent to the function specified in the constructor
 * Useful for debugging RPC requests which are not expecting as you expect.
 */
export class DebugSubprovider extends Subprovider {
    private readonly _debugCallback: WithDebugPayload;

    private static _generateRawTransactionAttributes(
        txn: TypedTransaction,
    ): DebugPayloadRawTransactionAttributes {
        const hexBufferToString = (value: Buffer): string => new BigNumber(value.toString('hex'), HEX_BASE).toString();

        let gasPrice
        if (txn instanceof FeeMarketEIP1559Transaction) {
            gasPrice = "0"
        } else {
            gasPrice = hexBufferToString(txn.gasPrice)
        }

        return {
            gasLimit: hexBufferToString(txn.gasLimit),
            gasPrice: gasPrice,
            nonce: hexBufferToString(txn.nonce),
            value: hexBufferToString(txn.value),
            // tslint:disable-next-line: no-unnecessary-type-assertion
            to: txn.to!.toString(),
        };
    }

    public constructor(debugCallback: WithDebugPayload = defaultDebugCallback) {
        super();
        this._debugCallback = debugCallback;
    }

    /**
     * This method conforms to the web3-provider-engine interface.
     * It is called internally by the ProviderEngine when it is this subproviders
     * turn to handle a JSON RPC request.
     * @param payload JSON RPC payload
     * @param next Callback to call if this subprovider decides not to handle the request
     * @param end Callback to call if subprovider handled the request and wants to pass back the request.
     */
    // tslint:disable-next-line:prefer-function-over-method async-suffix
    public async handleRequest(payload: JSONRPCRequestPayload, next: Callback, end: ErrorCallback): Promise<void> {
        const debugPayload: DebugPayload = payload;
        if (payload.method === 'eth_sendRawTransaction' && payload.params[0]) {
            const txn = TransactionFactory.fromSerializedData(toBuffer(payload.params[0]));
            debugPayload.rawTransactionAttributes = DebugSubprovider._generateRawTransactionAttributes(txn);
        }
        this._debugCallback(debugPayload);

        next();
    }
}
