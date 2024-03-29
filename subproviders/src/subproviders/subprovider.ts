import { JSONRPCRequestPayload, JSONRPCResponsePayload } from 'ethereum-types';
import { promisify } from 'util';
import Web3ProviderEngine = require('web3-provider-engine');

import { JSONRPCRequestPayloadWithMethod } from '../types';
/**
 * A altered version of the base class Subprovider found in [web3-provider-engine](https://github.com/MetaMask/provider-engine).
 * This one has an async/await `emitPayloadAsync` and also defined types.
 */
export abstract class Subprovider {
    // tslint:disable-next-line:underscore-private-and-protected
    private engine!: Web3ProviderEngine;
    protected static _createFinalPayload(
        payload: Partial<JSONRPCRequestPayloadWithMethod>,
    ): Partial<JSONRPCRequestPayloadWithMethod> {
        const finalPayload = {
            // defaults
            id: Subprovider._getRandomId(),
            jsonrpc: '2.0',
            params: [],
            ...payload,
        };
        return finalPayload;
    }
    // Ported from: https://github.com/MetaMask/provider-engine/blob/master/util/random-id.js
    private static _getRandomId(): number {
        const extraDigits = 3;
        const baseTen = 10;
        // 13 time digits
        const datePart = new Date().getTime() * Math.pow(baseTen, extraDigits);
        // 3 random digits
        const extraPart = Math.floor(Math.random() * Math.pow(baseTen, extraDigits));
        // 16 digits
        return datePart + extraPart;
    }
    /**
     * @param payload JSON RPC request payload
     * @param next A callback to pass the request to the next subprovider in the stack
     * @param end A callback called once the subprovider is done handling the request
     */
    // tslint:disable-next-line:async-suffix
    public abstract handleRequest(
        payload: JSONRPCRequestPayload,
        next: () => void,
        end: (err: Error | null, data?: any) => void,
    ): Promise<void>;

    /**
     * Emits a JSON RPC payload that will then be handled by the ProviderEngine instance
     * this subprovider is a part of. The payload will cascade down the subprovider middleware
     * stack until finding the responsible entity for handling the request.
     * @param payload JSON RPC payload
     * @returns JSON RPC response payload
     */
    public async emitPayloadAsync(payload: Partial<JSONRPCRequestPayloadWithMethod>): Promise<JSONRPCResponsePayload> {
        const finalPayload = Subprovider._createFinalPayload(payload);
        const sendAsync = promisify(this.engine.sendAsync.bind(this.engine));
        const response = await sendAsync(finalPayload as JSONRPCRequestPayload);
        return response;
    }
    /**
     * Set's the subprovider's engine to the ProviderEngine it is added to.
     * This is only called within the ProviderEngine source code, do not call
     * directly.
     * @param engine The ProviderEngine this subprovider is added to
     */
    public setEngine(engine: Web3ProviderEngine): void {
        this.engine = engine;
    }
}
