export declare const fixtureData: {
    NULL_ADDRESS: string;
    TEST_RPC_ACCOUNT_0: string;
    TEST_RPC_ACCOUNT_0_CHECKSUMMED: string;
    TEST_RPC_ACCOUNT_0_ACCOUNT_PRIVATE_KEY: string;
    TEST_RPC_ACCOUNT_1: string;
    TEST_RPC_MNEMONIC: string;
    TEST_RPC_MNEMONIC_BASE_DERIVATION_PATH: string;
    TEST_RPC_LEDGER_LIVE_ACCOUNT_0: string;
    TEST_RPC_LEDGER_LIVE_ACCOUNT_1: string;
    TEST_RPC_LEDGER_LIVE_DERIVATION_PATH: string;
    PERSONAL_MESSAGE_STRING: string;
    PERSONAL_MESSAGE_STRING_UTF8: string;
    PERSONAL_MESSAGE_SIGNED_RESULT: string;
    PERSONAL_MESSAGE_UTF8_LEDGER_SIGNED_RESULT: string;
    PERSONAL_MESSAGE_ACCOUNT_1_SIGNED_RESULT: string;
    PERSONAL_MESSAGE_LEDGER_LIVE_ACCOUNT_1_SIGNED_RESULT: string;
    TESTRPC_BASE_DERIVATION_PATH: string;
    NETWORK_ID: number;
    TX_DATA: {
        nonce: string;
        gasPrice: string;
        gas: string;
        to: string;
        value: string;
        chainId: number;
        from: string;
    };
    TX_DATA_2930: {
        nonce: string;
        gasPrice: string;
        gas: string;
        to: string;
        value: string;
        chainId: number;
        from: string;
        type: number;
        accessList: {
            address: string;
            storageKeys: never[];
        }[];
    };
    TX_DATA_SIGNED_RESULT: string;
    TX_DATA_SIGNED_RESULT_2930: string;
    TX_DATA_ACCOUNT_1_SIGNED_RESULT: string;
    TX_DATA_LEDGER_LIVE_ACCOUNT_1_SIGNED_RESULT: string;
    EIP712_TEST_TYPED_DATA: {
        types: {
            EIP712Domain: {
                name: string;
                type: string;
            }[];
            Test: {
                name: string;
                type: string;
            }[];
        };
        domain: {
            name: string;
        };
        message: {
            testAddress: string;
            testNumber: string;
        };
        primaryType: string;
    };
    EIP712_TEST_TYPED_DATA_HASH: string;
    EIP712_TEST_TYPED_DATA_SIGNED_RESULT: string;
    ERC20_TRANSFER_RPC_PAYLOAD: {
        id: number;
        jsonrpc: string;
        params: string[];
        method: string;
    };
    ETH_TRANSFER_PAYLOAD: {
        id: number;
        jsonrpc: string;
        params: string[];
        method: string;
    };
    ETH_GETBLOCK_RPC_PAYLOAD: {
        id: number;
        params: never[];
        jsonrpc: string;
        method: string;
    };
};
//# sourceMappingURL=fixture_data.d.ts.map