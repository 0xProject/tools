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
exports.TraceInfoSubprovider = void 0;
const web3_wrapper_1 = require("@0x/web3-wrapper");
const _ = require("lodash");
const constants_1 = require("./constants");
const trace_1 = require("./trace");
const trace_collection_subprovider_1 = require("./trace_collection_subprovider");
const utils_1 = require("./utils");
// TraceInfoSubprovider is extended by subproviders which need to work with one
// TraceInfo at a time. It has one abstract method: _handleTraceInfoAsync, which
// is called for each TraceInfo.
class TraceInfoSubprovider extends trace_collection_subprovider_1.TraceCollectionSubprovider {
    // tslint:disable prefer-function-over-method
    _handleTraceInfoAsync(_traceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(undefined);
        });
    }
    _recordTxTraceAsync(address, dataIfExists, txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._web3Wrapper.awaitTransactionMinedAsync(txHash, 0);
            const nodeType = yield this._web3Wrapper.getNodeTypeAsync();
            let trace;
            if (nodeType === web3_wrapper_1.NodeType.Geth) {
                // For very large traces we use a custom tracer that outputs a format compatible with a
                // regular trace. We only need the 2nd item on the stack when the instruction is a call.
                // By not including other stack values, we drastically limit the amount of data to be collected.
                // There are no good docs about how to write those tracers, but you can find some example ones here:
                // https://github.com/ethereum/go-ethereum/tree/master/eth/tracers/internal/tracers
                const tracer = `
                {
                    data: [],
                    extractStack: function (stack) {
                        var extract = [];
                        for (var i = 0; i < stack.length(); i++) {
                            extract.push('0x' + stack.peek(i).toString(16));
                        }
                        return extract;
                    },
                    step: function(log) {
                        const op = log.op.toString();
                        const opn = 0 | log.op.toNumber();
                        const pc = 0 | log.getPC();
                        const depth = 0 | log.getDepth();
                        const gasCost = 0 | log.getCost();
                        const gas = 0 | log.getGas();
                        const isCall = opn == 0xf1 || opn == 0xf2 || opn == 0xf4 || opn == 0xf5 || opn == 0xfa;
                        const isMemoryAccess = opn == 0x51 || opn == 0x52 || opn == 0x53;
                        const isCallDataAccess = opn == 0x37;
                        var stack;
                        if (isCall) {
                            stack = ['0x'+log.stack.peek(1).toString(16), null];
                        } else if (isMemoryAccess) {
                            stack = ['0x'+log.stack.peek(0).toString(16)];
                        } else if (isCallDataAccess) {
                            stack = ['0x'+log.stack.peek(2).toString(16), '0x'+log.stack.peek(1).toString(16), '0x'+log.stack.peek(0).toString(16)];
                        }
                        this.data.push({ pc, gasCost, depth, op, stack, gas });
                    },
                    fault: function() { },
                    result: function() { return {structLogs: this.data}; }
                }
            `;
                trace = yield this._web3Wrapper.getTransactionTraceAsync(txHash, { tracer, timeout: '600s' });
            }
            else {
                /**
                 * Ganache doesn't support custom tracers yet.
                 */
                trace = yield this._web3Wrapper.getTransactionTraceAsync(txHash, {
                    disableMemory: true,
                    disableStack: false,
                    disableStorage: true,
                });
            }
            trace.structLogs = utils_1.utils.normalizeStructLogs(trace.structLogs);
            const traceInfo = {
                trace,
                address,
                dataIfExists,
                txHash,
            };
            yield this._handleTraceInfoAsync(traceInfo);
            const contractAddressToTraces = trace_1.getContractAddressToTraces(trace.structLogs, address);
            const subcallAddresses = _.keys(contractAddressToTraces);
            if (address === constants_1.constants.NEW_CONTRACT) {
                for (const subcallAddress of subcallAddresses) {
                    let subTraceInfo;
                    const traceForThatSubcall = contractAddressToTraces[subcallAddress];
                    const subcallDepth = traceForThatSubcall[0].depth;
                    if (subcallAddress === 'NEW_CONTRACT') {
                        subTraceInfo = {
                            subcallDepth,
                            subtrace: traceForThatSubcall,
                            txHash,
                            address: subcallAddress,
                            bytecode: dataIfExists,
                        };
                    }
                    else {
                        const runtimeBytecode = yield this._web3Wrapper.getContractCodeAsync(subcallAddress);
                        subTraceInfo = {
                            subcallDepth,
                            subtrace: traceForThatSubcall,
                            txHash,
                            address: subcallAddress,
                            runtimeBytecode,
                        };
                    }
                    yield this._handleSubTraceInfoAsync(subTraceInfo);
                }
            }
            else {
                for (const subcallAddress of subcallAddresses) {
                    const runtimeBytecode = yield this._web3Wrapper.getContractCodeAsync(subcallAddress);
                    const traceForThatSubcall = contractAddressToTraces[subcallAddress];
                    const subcallDepth = traceForThatSubcall[0].depth;
                    const subTraceInfo = {
                        subcallDepth,
                        subtrace: traceForThatSubcall,
                        txHash,
                        address: subcallAddress,
                        runtimeBytecode,
                    };
                    yield this._handleSubTraceInfoAsync(subTraceInfo);
                }
            }
        });
    }
}
exports.TraceInfoSubprovider = TraceInfoSubprovider;
//# sourceMappingURL=trace_info_subprovider.js.map