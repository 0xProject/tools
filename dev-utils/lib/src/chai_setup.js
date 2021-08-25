"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chaiSetup = void 0;
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const ChaiBigNumber = require("chai-bignumber");
const dirtyChai = require("dirty-chai");
const chai_revert_error_1 = require("./chai_revert_error");
exports.chaiSetup = {
    configure() {
        chai.config.includeStack = true;
        // Order matters.
        chai.use(ChaiBigNumber());
        chai.use(chaiAsPromised);
        chai.use(chai_revert_error_1.revertErrorHelper);
        chai.use(dirtyChai);
    },
};
//# sourceMappingURL=chai_setup.js.map