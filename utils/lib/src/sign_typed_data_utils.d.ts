/// <reference types="node" />
import { EIP712Object, EIP712ObjectValue, EIP712TypedData, EIP712Types } from '@0x/types';
export declare const signTypedDataUtils: {
    /**
     * Generates the EIP712 Typed Data hash for signing
     * @param   typedData An object that conforms to the EIP712TypedData interface
     * @return  A Buffer containing the hash of the typed data.
     */
    generateTypedDataHash(typedData: EIP712TypedData): Buffer;
    /**
     * Generates the EIP712 Typed Data hash for a typed data object without using the domain field. This
     * makes hashing easier for non-EIP712 data.
     * @param   typedData An object that conforms to the EIP712TypedData interface
     * @return  A Buffer containing the hash of the typed data.
     */
    generateTypedDataHashWithoutDomain(typedData: EIP712TypedData): Buffer;
    /**
     * Generates the hash of a EIP712 Domain with the default schema
     * @param  domain An EIP712 domain with the default schema containing a name, version, chain id,
     *                and verifying address.
     * @return A buffer that contains the hash of the domain.
     */
    generateDomainHash(domain: EIP712Object): Buffer;
    _findDependencies(primaryType: string, types: EIP712Types, found?: string[]): string[];
    _encodeType(primaryType: string, types: EIP712Types): string;
    _encodeData(primaryType: string, data: EIP712Object, types: EIP712Types): string;
    _normalizeValue(type: string, value: any): EIP712ObjectValue;
    _typeHash(primaryType: string, types: EIP712Types): Buffer;
    _structHash(primaryType: string, data: EIP712Object, types: EIP712Types): Buffer;
};
//# sourceMappingURL=sign_typed_data_utils.d.ts.map