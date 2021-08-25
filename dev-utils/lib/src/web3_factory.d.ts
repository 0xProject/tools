import { Web3ProviderEngine } from '@0x/subproviders';
export interface Web3Config {
    total_accounts?: number;
    hasAddresses?: boolean;
    shouldUseInProcessGanache?: boolean;
    shouldThrowErrorsOnGanacheRPCResponse?: boolean;
    rpcUrl?: string;
    shouldUseFakeGasEstimate?: boolean;
    ganacheDatabasePath?: string;
    shouldAllowUnlimitedContractSize?: boolean;
    fork?: string;
    blockTime?: number;
    locked?: boolean;
    unlocked_accounts?: string[];
    hardfork?: string;
    gasLimit?: number;
    chainId?: number;
}
export declare const web3Factory: {
    getRpcProvider(config?: Web3Config): Web3ProviderEngine;
};
//# sourceMappingURL=web3_factory.d.ts.map