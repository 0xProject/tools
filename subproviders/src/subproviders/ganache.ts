import { JSONRPCRequestPayload } from 'ethereum-types';
import { EthereumProvider, provider, ProviderOptions } from 'ganache';

import { Subprovider } from './subprovider';

// Historical GanacheOpts for compatability
// This is handled in Ganache via EthereumLegacyProviderOptions which is not exported
export interface GanacheOpts {
    verbose?: boolean;
    logger?: {
        log(msg: string): void;
    };
    port?: number;
    network_id?: number;
    networkId?: number;
    // @deprecated  _chainId has been removed in 7.x
    _chainId?: number;
    chainId?: number;
    mnemonic?: string;
    allowUnlimitedContractSize?: boolean;
    gasLimit?: number;
    vmErrorsOnRPCResponse?: boolean;
    db_path?: string;
    total_accounts?: number;
    fork?: string;
    blockTime?: number;
    hardfork?: string;
    unlocked_accounts?: string[];
}

/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * It intercepts all JSON RPC requests and relays them to an in-process ganache instance.
 */
export class GanacheSubprovider extends Subprovider {
    private readonly _ganacheProvider: EthereumProvider;
    /**
     * Instantiates a GanacheSubprovider
     * @param opts The desired opts with which to instantiate the Ganache provider
     */
    constructor(opts: GanacheOpts) {
        super();
        // HACK: migrate from the old legacy opts to the supported EthereumLegacyProviderOptions
        const migratedOpts: ProviderOptions<'ethereum'> = {
            verbose: opts.verbose,
            logger: opts.logger,
            network_id: opts.network_id || opts.networkId,
            chainId: opts._chainId || opts.chainId,
            mnemonic: opts.mnemonic,
            gasLimit: opts.gasLimit,
            allowUnlimitedContractSize: opts.allowUnlimitedContractSize,
            vmErrorsOnRPCResponse: opts.vmErrorsOnRPCResponse,
            db_path: opts.db_path,
            total_accounts: opts.total_accounts,
            blockTime: opts.blockTime,
            unlocked_accounts: opts.unlocked_accounts,
            fork: { url: opts.fork },
            hardfork: opts.hardfork as any,
            asyncRequestProcessing: false,
        };
        // HACK: removed undefined values as this seems to cause an issue
        // when the keys are present, especially for `fork` option.
        Object.keys(migratedOpts).forEach(k => {
            if ((migratedOpts as any)[k] === undefined) {
                delete (migratedOpts as any)[k];
            }
        });
        if (!opts.fork) {
            delete migratedOpts.fork;
        }
        this._ganacheProvider = provider(migratedOpts) as EthereumProvider;
    }
    /**
     * This method conforms to the web3-provider-engine interface.
     * It is called internally by the ProviderEngine when it is this subproviders
     * turn to handle a JSON RPC request.
     * @param payload JSON RPC payload
     * @param _next Callback to call if this subprovider decides not to handle the request
     * @param end Callback to call if subprovider handled the request and wants to pass back the request.
     */
    // tslint:disable-next-line:prefer-function-over-method async-suffix
    public async handleRequest(
        payload: JSONRPCRequestPayload,
        _next: () => void,
        end: (err: Error | null, data?: any) => void,
    ): Promise<void> {
        this._ganacheProvider.sendAsync(payload as any, (err: Error | undefined, result: any) => {
            end(err ? err : null, result && result.result);
        });
    }
}
