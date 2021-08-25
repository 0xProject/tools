"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3Factory = void 0;
const subproviders_1 = require("@0x/subproviders");
const utils_1 = require("@0x/utils");
const fs = require("fs");
const constants_1 = require("./constants");
const env_1 = require("./env");
exports.web3Factory = {
    getRpcProvider(config = {}) {
        const provider = new subproviders_1.Web3ProviderEngine();
        const hasAddresses = config.hasAddresses === undefined || config.hasAddresses;
        const shouldUseFakeGasEstimate = config.shouldUseFakeGasEstimate === undefined || config.shouldUseFakeGasEstimate;
        if (!hasAddresses) {
            provider.addProvider(new subproviders_1.EmptyWalletSubprovider());
        }
        if (shouldUseFakeGasEstimate) {
            provider.addProvider(new subproviders_1.FakeGasEstimateSubprovider(constants_1.constants.GAS_LIMIT));
        }
        const logger = {
            log: (arg) => {
                fs.appendFileSync('ganache.log', `${arg}\n`);
            },
        };
        const shouldUseInProcessGanache = !!config.shouldUseInProcessGanache;
        if (shouldUseInProcessGanache) {
            if (config.rpcUrl !== undefined) {
                throw new Error('Cannot use both GanacheSubprovider and RPCSubprovider');
            }
            if (config.ganacheDatabasePath !== undefined) {
                const doesDatabaseAlreadyExist = fs.existsSync(config.ganacheDatabasePath);
                if (!doesDatabaseAlreadyExist) {
                    // Working with local DB snapshot. Ganache requires this directory to exist
                    fs.mkdirSync(config.ganacheDatabasePath);
                }
            }
            const shouldThrowErrorsOnGanacheRPCResponse = config.shouldThrowErrorsOnGanacheRPCResponse === undefined ||
                config.shouldThrowErrorsOnGanacheRPCResponse;
            provider.addProvider(new subproviders_1.GanacheSubprovider({
                total_accounts: config.total_accounts,
                vmErrorsOnRPCResponse: shouldThrowErrorsOnGanacheRPCResponse,
                db_path: config.ganacheDatabasePath,
                allowUnlimitedContractSize: config.shouldAllowUnlimitedContractSize,
                gasLimit: config.gasLimit || constants_1.constants.GAS_LIMIT,
                logger,
                verbose: env_1.env.parseBoolean(env_1.EnvVars.VerboseGanache),
                port: 8545,
                network_id: config.chainId === undefined ? 1337 : config.chainId,
                _chainId: config.chainId === undefined ? 1337 : config.chainId,
                mnemonic: 'concert load couple harbor equip island argue ramp clarify fence smart topic',
                fork: config.fork,
                blockTime: config.blockTime,
                locked: config.locked,
                unlocked_accounts: config.unlocked_accounts,
                hardfork: config.hardfork || 'istanbul',
            }));
        }
        else {
            provider.addProvider(new subproviders_1.RPCSubprovider(config.rpcUrl || constants_1.constants.RPC_URL));
        }
        utils_1.providerUtils.startProviderEngine(provider);
        return provider;
    },
};
//# sourceMappingURL=web3_factory.js.map