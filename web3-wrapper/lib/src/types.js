"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeType = exports.Web3WrapperErrors = void 0;
var Web3WrapperErrors;
(function (Web3WrapperErrors) {
    Web3WrapperErrors["TransactionMiningTimeout"] = "TRANSACTION_MINING_TIMEOUT";
})(Web3WrapperErrors = exports.Web3WrapperErrors || (exports.Web3WrapperErrors = {}));
// NodeType represents the type of the backing Ethereum node.
var NodeType;
(function (NodeType) {
    NodeType["Geth"] = "GETH";
    NodeType["Ganache"] = "GANACHE";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
//# sourceMappingURL=types.js.map