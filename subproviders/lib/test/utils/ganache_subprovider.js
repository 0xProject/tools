"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ganacheSubprovider = void 0;
const fs = require("fs");
const ganache_1 = require("../../src/subproviders/ganache");
const configs_1 = require("../utils/configs");
const logger = {
    log: (arg) => {
        fs.appendFileSync('ganache.log', `${arg}\n`);
    },
};
exports.ganacheSubprovider = new ganache_1.GanacheSubprovider({
    logger,
    verbose: false,
    port: configs_1.configs.port,
    networkId: configs_1.configs.networkId,
    mnemonic: configs_1.configs.mnemonic,
});
//# sourceMappingURL=ganache_subprovider.js.map