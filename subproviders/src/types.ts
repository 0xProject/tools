import { Hardfork } from '@ethereumjs/common';
import { JSONRPCRequestPayload } from 'ethereum-types';
import HDNode = require('hdkey');

/**
 * mnemonic: The string mnemonic seed
 * addressSearchLimit: The maximum number of addresses to search through, defaults to 1000
 * baseDerivationPath: The base derivation path (e.g 44'/60'/0'/0)
 * chainId: The chain ID. Defaults to 1 (mainnet).
 * hardfork: The chain's active hardfork. Defaults to istanbul.
 */
export interface MnemonicWalletSubproviderConfigs {
    mnemonic: string;
    addressSearchLimit?: number;
    baseDerivationPath?: string;
    chainId?: number;
    hardfork?: Hardfork;
}

export interface SignatureData {
    hash: string;
    r: string;
    s: string;
    v: number;
}

export interface PartialTxParams {
    nonce: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gas: string;
    to: string;
    from: string;
    value?: string;
    data?: string;
    type?: number;
    accessList?: Array<{ address: string; storageKeys: string[] }>;
}

export type DoneCallback = (err?: Error) => void;

export enum WalletSubproviderErrors {
    AddressNotFound = 'ADDRESS_NOT_FOUND',
    DataMissingForSignPersonalMessage = 'DATA_MISSING_FOR_SIGN_PERSONAL_MESSAGE',
    DataMissingForSignTypedData = 'DATA_MISSING_FOR_SIGN_TYPED_DATA',
    SenderInvalidOrNotSupplied = 'SENDER_INVALID_OR_NOT_SUPPLIED',
    FromAddressMissingOrInvalid = 'FROM_ADDRESS_MISSING_OR_INVALID',
    MethodNotSupported = 'METHOD_NOT_SUPPORTED',
}

export interface DerivedHDKeyInfo {
    address: string;
    baseDerivationPath: string;
    derivationPath: string;
    hdKey: HDNode;
}

export interface JSONRPCRequestPayloadWithMethod extends JSONRPCRequestPayload {
    method: string;
}
