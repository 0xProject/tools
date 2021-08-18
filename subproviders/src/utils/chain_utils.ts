import { Chain, default as Common, Hardfork } from '@ethereumjs/common';

function createCommonFork(chainId: number, fork: Hardfork = Hardfork.Istanbul): Common {
    return Common.custom(
        {
            chainId,
            name: `common-${fork}-${chainId}`,
            defaultHardfork: fork,
        },
        {
            baseChain: Chain.Mainnet,
        },
    );
}

// tslint:disable: indent
const DEFAULT_COMMON_BY_CHAIN_ID: { [chainId: string]: Common } = {
    [Chain.Mainnet]: createCommonFork(Chain.Mainnet, Hardfork.London),
    [Chain.Ropsten]: createCommonFork(Chain.Ropsten, Hardfork.London),
    [Chain.Rinkeby]: createCommonFork(Chain.Rinkeby, Hardfork.London),
    [Chain.Kovan]: createCommonFork(Chain.Kovan, Hardfork.Berlin),
    '1337': createCommonFork(1337, Hardfork.Istanbul),
};

/**
 * Create a Common instance given a chainId and optional hardfork.
 */
export function getCommonForChain(chainId: number, hardfork?: Hardfork): Common {
    return hardfork || !DEFAULT_COMMON_BY_CHAIN_ID[chainId]
        ? createCommonFork(chainId, hardfork)
        : DEFAULT_COMMON_BY_CHAIN_ID[chainId];
}
