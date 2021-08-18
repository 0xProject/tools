import { providerUtils } from '@0x/utils';
import { CallDataRPC, marshaller, TxDataRPC, Web3Wrapper } from '@0x/web3-wrapper';
import { default as Common } from '@ethereumjs/common';
import { CallData, JSONRPCRequestPayload, SupportedProvider, TxData, ZeroExProvider } from 'ethereum-types';

import { Callback, ErrorCallback } from '../types';
import { getCommonForChain } from '../utils/chain_utils';

import { Subprovider } from './subprovider';

/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine)
 * subprovider interface and the provider sendAsync interface.
 * It handles inconsistencies with Metamask implementations of various JSON RPC methods.
 * It forwards JSON RPC requests involving the domain of a signer (getAccounts,
 * sendTransaction, signMessage etc...) to the provider instance supplied at instantiation. All other requests
 * are passed onwards for subsequent subproviders to handle.
 */
export class MetamaskSubprovider extends Subprovider {
    private readonly _web3Wrapper: Web3Wrapper;
    private readonly _provider: ZeroExProvider;
    private _common?: Common;

    /**
     * Instantiates a new MetamaskSubprovider
     * @param supportedProvider Web3 provider that should handle  all user account related requests
     */
    constructor(supportedProvider: SupportedProvider) {
        super();
        const provider = providerUtils.standardizeOrThrow(supportedProvider);
        this._web3Wrapper = new Web3Wrapper(provider);
        this._provider = provider;
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
    public async handleRequest(payload: JSONRPCRequestPayload, _next: Callback, end: ErrorCallback): Promise<void> {
        let message;
        let address;
        switch (payload.method) {
            case 'web3_clientVersion':
                try {
                    const nodeVersion = await this._web3Wrapper.getNodeVersionAsync();
                    end(null, nodeVersion);
                } catch (err) {
                    end(err);
                }
                return;
            case 'eth_accounts':
                try {
                    const accounts = await this._web3Wrapper.getAvailableAddressesAsync();
                    end(null, accounts);
                } catch (err) {
                    end(err);
                }
                return;
            case 'eth_call': {
                try {
                    const txData = cleanTxDataForChain<CallDataRPC, CallData>(
                        await this._getCommonAsync(),
                        payload.params[0],
                    );
                    const txHash = await this._web3Wrapper.callAsync(txData);
                    end(null, txHash);
                } catch (err) {
                    end(err);
                }
                return;
            }
            case 'eth_sendTransaction': {
                try {
                    const txData = cleanTxDataForChain<TxDataRPC, TxData>(
                        await this._getCommonAsync(),
                        payload.params[0],
                    );
                    const txHash = await this._web3Wrapper.sendTransactionAsync(txData);
                    end(null, txHash);
                } catch (err) {
                    end(err);
                }
                return;
            }
            case 'eth_sign':
                [address, message] = payload.params;
                try {
                    // Metamask incorrectly implements eth_sign and does not prefix the message as per the spec
                    // It does however implement personal_sign and will leave off the prefix when used as a proxy for hardware wallets
                    // Source: https://metamask.github.io/metamask-docs/API_Reference/Signing_Data/Personal_Sign
                    // See: https://github.com/MetaMask/eth-ledger-bridge-keyring/blob/master/index.js#L192
                    // and https://github.com/MetaMask/eth-trezor-keyring/blob/master/index.js#L211
                    // and https://github.com/MetaMask/eth-sig-util/blob/master/index.js#L250
                    const signature = await this._web3Wrapper.sendRawPayloadAsync<string>({
                        method: 'personal_sign',
                        params: [message, address],
                    });
                    signature ? end(null, signature) : end(new Error('Error performing eth_sign'), null);
                } catch (err) {
                    end(err);
                }
                return;
            // Metamask supports different versions of the `eth_signTypedData` RPC method.
            case 'eth_signTypedData':
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData_v4':
                [address, message] = payload.params;
                try {
                    // We accept either JSON-serialized or object messages.
                    const messageObject = typeof message === 'object' ? message : JSON.parse(message);
                    const signature = await this._web3Wrapper.sendRawPayloadAsync<string>({
                        method: payload.method,
                        // `eth_signTypedData` takes a raw object.
                        params: [
                            address,
                            payload.method === 'eth_signTypedData' ? messageObject : JSON.stringify(messageObject),
                        ],
                    });
                    signature ? end(null, signature) : end(new Error('Error performing eth_signTypedData'), null);
                } catch (err) {
                    end(err);
                }
                return;
            default:
                this._provider.sendAsync(payload, (err, response) => {
                    if (err) {
                        return end(err);
                    }
                    if (!response || response.result === undefined) {
                        return end(new Error(`No result for ${payload.method} RPC call`));
                    }
                    if (response.error) {
                        return end(new Error(response.error.message || (response.error as any)));
                    }
                    end(err, response.result);
                });
                return;
        }
    }
    /**
     * This method conforms to the provider sendAsync interface.
     * Allowing the MetamaskSubprovider to be used as a generic provider (outside of Web3ProviderEngine) with the
     * addition of wrapping the inconsistent Metamask behaviour
     * @param payload JSON RPC payload
     * @return The contents nested under the result key of the response body
     */
    public sendAsync(payload: JSONRPCRequestPayload, callback: ErrorCallback): void {
        void this.handleRequest(
            payload,
            // handleRequest has decided to not handle this, so fall through to the provider
            () => {
                const sendAsync = this._provider.sendAsync.bind(this._provider);
                sendAsync(payload, callback);
            },
            // handleRequest has called end and will handle this
            (err, data) => {
                err ? callback(err) : callback(null, { ...payload, result: data });
            },
        );
    }

    private async _getCommonAsync(): Promise<Common> {
        if (this._common) {
            return this._common;
        }
        const chainId = await this._web3Wrapper.getChainIdAsync();
        return (this._common = getCommonForChain(chainId));
    }
}

function cleanTxDataForChain<TRPCData extends TxDataRPC | CallDataRPC, TData extends TxData | CallData>(
    common: Common,
    rpcData: TRPCData,
): TData {
    const txData = marshaller.unmarshalTxData(rpcData) as TData;
    if (common.isActivatedEIP(1559)) {
        // If 1559 fields are present, remove legacy gasPrice.
        if (txData.maxFeePerGas || txData.maxPriorityFeePerGas) {
            delete txData.gasPrice;
        }
    } else {
        // Remove 1559 fields on legacy fee networks.
        delete txData.maxFeePerGas;
        delete txData.maxPriorityFeePerGas;
    }
    // Delete access list on networks that don't support it.
    if (!common.isActivatedEIP(2930)) {
        delete txData.accessList;
    }
    return txData;
}
