import { BlockParam, BlockWithoutTransactionData, BlockWithTransactionData, CallData, CallTxDataBase, GethCallOverrides, LogEntry, RawLogEntry, Transaction, TransactionReceipt, TxData } from 'ethereum-types';
import { BlockWithoutTransactionDataRPC, BlockWithTransactionDataRPC, CallDataRPC, CallTxDataBaseRPC, GethCallOverridesRPC, TransactionReceiptRPC, TransactionRPC, TxDataRPC } from './types';
/**
 * Utils to convert ethereum structures from user-space format to RPC format. (marshall/unmarshall)
 */
export declare const marshaller: {
    /**
     * Unmarshall block without transaction data
     * @param blockWithHexValues block to unmarshall
     * @return unmarshalled block without transaction data
     */
    unmarshalIntoBlockWithoutTransactionData(blockWithHexValues: BlockWithoutTransactionDataRPC): BlockWithoutTransactionData;
    /**
     * Unmarshall block with transaction data
     * @param blockWithHexValues block to unmarshall
     * @return unmarshalled block with transaction data
     */
    unmarshalIntoBlockWithTransactionData(blockWithHexValues: BlockWithTransactionDataRPC): BlockWithTransactionData;
    /**
     * Unmarshall transaction
     * @param txRpc transaction to unmarshall
     * @return unmarshalled transaction
     */
    unmarshalTransaction(txRpc: TransactionRPC): Transaction;
    /**
     * Unmarshall transaction receipt
     * @param txReceiptRpc transaction receipt to unmarshall
     * @return unmarshalled transaction receipt
     */
    unmarshalTransactionReceipt(txReceiptRpc: TransactionReceiptRPC): TransactionReceipt;
    /**
     * Unmarshall transaction data
     * @param txDataRpc transaction data to unmarshall
     * @return unmarshalled transaction data
     */
    unmarshalTxData(txDataRpc: TxDataRPC): TxData;
    /**
     * Marshall transaction data
     * @param txData transaction data to marshall
     * @return marshalled transaction data
     */
    marshalTxData(txData: Partial<TxData>): Partial<TxDataRPC>;
    /**
     * Marshall call data
     * @param callData call data to marshall
     * @return marshalled call data
     */
    marshalCallData(callData: Partial<CallData>): Partial<CallDataRPC>;
    /**
     * Marshall call overrides parameter for for a geth eth_call.
     * @param overrides overrides to marshal
     * @return marshalled overrides
     */
    marshalCallOverrides(overrides: GethCallOverrides): GethCallOverridesRPC;
    /**
     * Marshall address
     * @param address address to marshall
     * @return marshalled address
     */
    marshalAddress(address: string): string;
    /**
     * Marshall block param
     * @param blockParam block param to marshall
     * @return marshalled block param
     */
    marshalBlockParam(blockParam: BlockParam | string | number | undefined): string | undefined;
    /**
     * Unmarshall log
     * @param rawLog log to unmarshall
     * @return unmarshalled log
     */
    unmarshalLog(rawLog: RawLogEntry): LogEntry;
    _marshalCallTxDataBase(callTxDataBase: Partial<CallTxDataBase>): Partial<CallTxDataBaseRPC>;
};
//# sourceMappingURL=marshaller.d.ts.map