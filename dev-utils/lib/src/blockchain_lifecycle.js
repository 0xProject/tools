"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainLifecycle = void 0;
const utils_1 = require("@0x/utils");
const web3_wrapper_1 = require("@0x/web3-wrapper");
// HACK(albrow): 🐉 We have to do this so that debug.setHead works correctly.
// (Geth does not seem to like debug.setHead(0), so by sending some transactions
// we increase the current block number beyond 0). Additionally, some tests seem
// to break when there are fewer than 3 blocks in the chain. (We have no idea
// why, but it was consistently reproducible).
const MINIMUM_BLOCKS = 3;
class BlockchainLifecycle {
    constructor(web3Wrapper) {
        this._addresses = [];
        this._web3Wrapper = web3Wrapper;
        this._snapshotIdsStack = [];
    }
    startAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeType = yield this._getNodeTypeAsync();
            switch (nodeType) {
                case web3_wrapper_1.NodeType.Ganache:
                    const snapshotId = yield this._web3Wrapper.takeSnapshotAsync();
                    this._snapshotIdsStack.push(snapshotId);
                    break;
                case web3_wrapper_1.NodeType.Geth:
                    let blockNumber = yield this._web3Wrapper.getBlockNumberAsync();
                    if (blockNumber < MINIMUM_BLOCKS) {
                        // If the minimum block number is not met, force Geth to
                        // mine some blocks by sending some dummy transactions.
                        yield this._mineMinimumBlocksAsync();
                        blockNumber = yield this._web3Wrapper.getBlockNumberAsync();
                    }
                    this._snapshotIdsStack.push(blockNumber);
                    // HACK(albrow) It's possible that we applied a time offset but
                    // the transaction we mined to put that time offset into the
                    // blockchain was reverted. As a workaround, we mine a new dummy
                    // block so that the latest block timestamp accounts for any
                    // possible time offsets.
                    yield this._mineDummyBlockAsync();
                    break;
                default:
                    throw new Error(`Unknown node type: ${nodeType}`);
            }
        });
    }
    revertAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeType = yield this._getNodeTypeAsync();
            switch (nodeType) {
                case web3_wrapper_1.NodeType.Ganache:
                    const snapshotId = this._snapshotIdsStack.pop();
                    const didRevert = yield this._web3Wrapper.revertSnapshotAsync(snapshotId);
                    if (!didRevert) {
                        throw new Error(`Snapshot with id #${snapshotId} failed to revert`);
                    }
                    break;
                case web3_wrapper_1.NodeType.Geth:
                    const blockNumber = this._snapshotIdsStack.pop();
                    yield this._web3Wrapper.setHeadAsync(blockNumber);
                    break;
                default:
                    throw new Error(`Unknown node type: ${nodeType}`);
            }
        });
    }
    _mineMinimumBlocksAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logUtils.warn('WARNING: minimum block number for tests not met. Mining additional blocks...');
            while ((yield this._web3Wrapper.getBlockNumberAsync()) < MINIMUM_BLOCKS) {
                utils_1.logUtils.warn('Mining block...');
                yield this._mineDummyBlockAsync();
            }
            utils_1.logUtils.warn('Done mining the minimum number of blocks.');
        });
    }
    _getNodeTypeAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._nodeType === undefined) {
                this._nodeType = yield this._web3Wrapper.getNodeTypeAsync();
            }
            return this._nodeType;
        });
    }
    // Sends a transaction that has no real effect on the state and waits for it
    // to be mined.
    _mineDummyBlockAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._addresses.length === 0) {
                this._addresses = yield this._web3Wrapper.getAvailableAddressesAsync();
                if (this._addresses.length === 0) {
                    throw new Error('No accounts found');
                }
            }
            yield this._web3Wrapper.awaitTransactionMinedAsync(yield this._web3Wrapper.sendTransactionAsync({
                from: this._addresses[0],
                to: this._addresses[0],
                value: '0',
            }), 0);
        });
    }
}
exports.BlockchainLifecycle = BlockchainLifecycle;
//# sourceMappingURL=blockchain_lifecycle.js.map