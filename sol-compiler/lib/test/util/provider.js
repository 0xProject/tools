"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = void 0;
const dev_utils_1 = require("@0x/dev-utils");
const providerConfigs = { shouldUseInProcessGanache: true };
const provider = dev_utils_1.web3Factory.getRpcProvider(providerConfigs);
exports.provider = provider;
//# sourceMappingURL=provider.js.map