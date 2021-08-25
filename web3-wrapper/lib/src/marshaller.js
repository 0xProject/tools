"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marshaller = void 0;
const utils_1 = require("@0x/utils");
const ethereum_types_1 = require("ethereum-types");
const ethUtil = require("ethereumjs-util");
const _ = require("lodash");
const utils_2 = require("./utils");
/**
 * Utils to convert ethereum structures from user-space format to RPC format. (marshall/unmarshall)
 */
exports.marshaller = {
    /**
     * Unmarshall block without transaction data
     * @param blockWithHexValues block to unmarshall
     * @return unmarshalled block without transaction data
     */
    unmarshalIntoBlockWithoutTransactionData(blockWithHexValues) {
        const block = Object.assign(Object.assign({}, blockWithHexValues), { gasLimit: utils_2.utils.convertHexToNumber(blockWithHexValues.gasLimit), gasUsed: utils_2.utils.convertHexToNumber(blockWithHexValues.gasUsed), size: utils_2.utils.convertHexToNumber(blockWithHexValues.size), timestamp: utils_2.utils.convertHexToNumber(blockWithHexValues.timestamp), number: blockWithHexValues.number === null ? null : utils_2.utils.convertHexToNumber(blockWithHexValues.number), difficulty: utils_2.utils.convertAmountToBigNumber(blockWithHexValues.difficulty), totalDifficulty: utils_2.utils.convertAmountToBigNumber(blockWithHexValues.totalDifficulty) });
        return block;
    },
    /**
     * Unmarshall block with transaction data
     * @param blockWithHexValues block to unmarshall
     * @return unmarshalled block with transaction data
     */
    unmarshalIntoBlockWithTransactionData(blockWithHexValues) {
        const block = Object.assign(Object.assign({}, blockWithHexValues), { gasLimit: utils_2.utils.convertHexToNumber(blockWithHexValues.gasLimit), gasUsed: utils_2.utils.convertHexToNumber(blockWithHexValues.gasUsed), size: utils_2.utils.convertHexToNumber(blockWithHexValues.size), timestamp: utils_2.utils.convertHexToNumber(blockWithHexValues.timestamp), number: blockWithHexValues.number === null ? null : utils_2.utils.convertHexToNumber(blockWithHexValues.number), difficulty: utils_2.utils.convertAmountToBigNumber(blockWithHexValues.difficulty), totalDifficulty: utils_2.utils.convertAmountToBigNumber(blockWithHexValues.totalDifficulty), transactions: [] });
        block.transactions = _.map(blockWithHexValues.transactions, (tx) => {
            const transaction = exports.marshaller.unmarshalTransaction(tx);
            return transaction;
        });
        return block;
    },
    /**
     * Unmarshall transaction
     * @param txRpc transaction to unmarshall
     * @return unmarshalled transaction
     */
    unmarshalTransaction(txRpc) {
        const tx = Object.assign(Object.assign({}, txRpc), { blockNumber: txRpc.blockNumber !== null ? utils_2.utils.convertHexToNumber(txRpc.blockNumber) : null, transactionIndex: txRpc.transactionIndex !== null ? utils_2.utils.convertHexToNumber(txRpc.transactionIndex) : null, nonce: utils_2.utils.convertHexToNumber(txRpc.nonce), gas: utils_2.utils.convertHexToNumber(txRpc.gas), gasPrice: utils_2.utils.convertAmountToBigNumber(txRpc.gasPrice), value: utils_2.utils.convertAmountToBigNumber(txRpc.value) });
        return tx;
    },
    /**
     * Unmarshall transaction receipt
     * @param txReceiptRpc transaction receipt to unmarshall
     * @return unmarshalled transaction receipt
     */
    unmarshalTransactionReceipt(txReceiptRpc) {
        const txReceipt = Object.assign(Object.assign({}, txReceiptRpc), { blockNumber: utils_2.utils.convertHexToNumber(txReceiptRpc.blockNumber), transactionIndex: utils_2.utils.convertHexToNumber(txReceiptRpc.transactionIndex), cumulativeGasUsed: utils_2.utils.convertHexToNumber(txReceiptRpc.cumulativeGasUsed), gasUsed: utils_2.utils.convertHexToNumber(txReceiptRpc.gasUsed), logs: _.map(txReceiptRpc.logs, exports.marshaller.unmarshalLog.bind(exports.marshaller)) });
        return txReceipt;
    },
    /**
     * Unmarshall transaction data
     * @param txDataRpc transaction data to unmarshall
     * @return unmarshalled transaction data
     */
    unmarshalTxData(txDataRpc) {
        if (txDataRpc.from === undefined) {
            throw new Error(`txData must include valid 'from' value.`);
        }
        const txData = {
            to: txDataRpc.to,
            from: txDataRpc.from,
            data: txDataRpc.data,
            value: txDataRpc.value !== undefined ? utils_2.utils.convertAmountToBigNumber(txDataRpc.value) : undefined,
            gas: txDataRpc.gas !== undefined ? utils_2.utils.convertHexToNumber(txDataRpc.gas) : undefined,
            gasPrice: txDataRpc.gasPrice !== undefined ? utils_2.utils.convertAmountToBigNumber(txDataRpc.gasPrice) : undefined,
            nonce: txDataRpc.nonce !== undefined ? utils_2.utils.convertHexToNumber(txDataRpc.nonce) : undefined,
        };
        return txData;
    },
    /**
     * Marshall transaction data
     * @param txData transaction data to marshall
     * @return marshalled transaction data
     */
    marshalTxData(txData) {
        if (txData.from === undefined) {
            throw new Error(`txData must include valid 'from' value.`);
        }
        const callTxDataBase = Object.assign({}, txData);
        delete callTxDataBase.from;
        const callTxDataBaseRPC = exports.marshaller._marshalCallTxDataBase(callTxDataBase);
        const txDataRPC = Object.assign(Object.assign({}, callTxDataBaseRPC), { from: exports.marshaller.marshalAddress(txData.from) });
        const prunableIfUndefined = ['gasPrice', 'gas', 'value', 'nonce'];
        _.each(txDataRPC, (value, key) => {
            if (value === undefined && _.includes(prunableIfUndefined, key)) {
                delete txDataRPC[key];
            }
        });
        return txDataRPC;
    },
    /**
     * Marshall call data
     * @param callData call data to marshall
     * @return marshalled call data
     */
    marshalCallData(callData) {
        const callTxDataBase = Object.assign({}, callData);
        delete callTxDataBase.from;
        delete callTxDataBase.overrides;
        const callTxDataBaseRPC = exports.marshaller._marshalCallTxDataBase(callTxDataBase);
        const callDataRPC = Object.assign(Object.assign({}, callTxDataBaseRPC), { from: callData.from === undefined ? undefined : exports.marshaller.marshalAddress(callData.from) });
        return callDataRPC;
    },
    /**
     * Marshall call overrides parameter for for a geth eth_call.
     * @param overrides overrides to marshal
     * @return marshalled overrides
     */
    marshalCallOverrides(overrides) {
        const marshalled = {};
        for (const address in overrides) {
            if (address) {
                const override = overrides[address];
                const marshalledAddress = exports.marshaller.marshalAddress(address);
                const marshalledOverride = (marshalled[marshalledAddress] = {});
                if (override.code !== undefined) {
                    marshalledOverride.code = override.code;
                }
                if (override.nonce !== undefined) {
                    marshalledOverride.nonce = utils_2.utils.encodeAmountAsHexString(override.nonce);
                }
                if (override.balance !== undefined) {
                    marshalledOverride.balance = utils_2.utils.encodeAmountAsHexString(override.balance);
                }
                if (Object.keys(marshalledOverride).length === 0) {
                    delete marshalled[marshalledAddress];
                }
            }
        }
        return marshalled;
    },
    /**
     * Marshall address
     * @param address address to marshall
     * @return marshalled address
     */
    marshalAddress(address) {
        if (utils_1.addressUtils.isAddress(address)) {
            return ethUtil.addHexPrefix(address);
        }
        throw new Error(`Invalid address encountered: ${address}`);
    },
    /**
     * Marshall block param
     * @param blockParam block param to marshall
     * @return marshalled block param
     */
    marshalBlockParam(blockParam) {
        if (blockParam === undefined) {
            return ethereum_types_1.BlockParamLiteral.Latest;
        }
        const encodedBlockParam = _.isNumber(blockParam) ? utils_2.utils.numberToHex(blockParam) : blockParam;
        return encodedBlockParam;
    },
    /**
     * Unmarshall log
     * @param rawLog log to unmarshall
     * @return unmarshalled log
     */
    unmarshalLog(rawLog) {
        const formattedLog = Object.assign(Object.assign({}, rawLog), { logIndex: utils_2.utils.convertHexToNumberOrNull(rawLog.logIndex), blockNumber: utils_2.utils.convertHexToNumberOrNull(rawLog.blockNumber), transactionIndex: utils_2.utils.convertHexToNumberOrNull(rawLog.transactionIndex) });
        return formattedLog;
    },
    _marshalCallTxDataBase(callTxDataBase) {
        let accessList;
        if (callTxDataBase.accessList && Object.keys(callTxDataBase.accessList).length) {
            accessList = Object.entries(callTxDataBase.accessList).map(([address, storageKeys]) => ({
                address,
                storageKeys,
            }));
        }
        const callTxDataBaseRPC = Object.assign({ data: callTxDataBase.data, to: callTxDataBase.to === undefined ? undefined : exports.marshaller.marshalAddress(callTxDataBase.to), gasPrice: callTxDataBase.gasPrice === undefined
                ? undefined
                : utils_2.utils.encodeAmountAsHexString(callTxDataBase.gasPrice), gas: callTxDataBase.gas === undefined ? undefined : utils_2.utils.encodeAmountAsHexString(callTxDataBase.gas), value: callTxDataBase.value === undefined ? undefined : utils_2.utils.encodeAmountAsHexString(callTxDataBase.value), nonce: callTxDataBase.nonce === undefined ? undefined : utils_2.utils.encodeAmountAsHexString(callTxDataBase.nonce) }, (accessList ? { type: 0x1, accessList } : {}));
        return callTxDataBaseRPC;
    },
};
//# sourceMappingURL=marshaller.js.map