import ethUtil = require('ethereumjs-util');
import HDNode = require('hdkey');

import { DerivedHDKeyInfo } from '../types';

const DEFAULT_ADDRESS_SEARCH_LIMIT = 1000;

class DerivedHDKeyInfoIterator implements IterableIterator<DerivedHDKeyInfo> {
    private readonly _parentDerivedKeyInfo: DerivedHDKeyInfo;
    private readonly _searchLimit: number;
    private _index: number;

    constructor(initialDerivedKey: DerivedHDKeyInfo, searchLimit: number = DEFAULT_ADDRESS_SEARCH_LIMIT) {
        this._searchLimit = searchLimit;
        this._parentDerivedKeyInfo = initialDerivedKey;
        this._index = 0;
    }

    public next(): IteratorResult<DerivedHDKeyInfo> {
        console.log("DerivedHDKeyInfoIterator");

        const baseDerivationPath = this._parentDerivedKeyInfo.baseDerivationPath;

        console.log({baseDerivationPath});

        const derivationIndex = this._index;

        console.log({derivationIndex});

        let fullDerivationPath;
        if (baseDerivationPath.includes("x")) {
            fullDerivationPath = baseDerivationPath.replace("x", derivationIndex.toString(10));
        } else {
            fullDerivationPath = `m/${baseDerivationPath}/${derivationIndex}`;
        }
        console.log({fullDerivationPath});

        const path = `m/${derivationIndex}`;

        console.log({path});

        const hdKey = this._parentDerivedKeyInfo.hdKey.derive(path);

        console.log({hdKey});

        const address = walletUtils.addressOfHDKey(hdKey);

        console.log({address});

        const derivedKey = {
            address,
            hdKey,
            baseDerivationPath,
            derivationPath: fullDerivationPath,
        };

        const isDone = this._index === this._searchLimit;

        this._index++;

        return {
            done: isDone,
            value: derivedKey,
        };
    }

    public [Symbol.iterator](): IterableIterator<DerivedHDKeyInfo> {
        return this;
    }
}

export const walletUtils = {
    calculateDerivedHDKeyInfos(parentDerivedKeyInfo: DerivedHDKeyInfo, numberOfKeys: number): DerivedHDKeyInfo[] {
        const derivedKeys: DerivedHDKeyInfo[] = [];
        const derivedKeyIterator = new DerivedHDKeyInfoIterator(parentDerivedKeyInfo, numberOfKeys);
        for (const key of derivedKeyIterator) {
            derivedKeys.push(key);
        }
        return derivedKeys;
    },
    findDerivedKeyInfoForAddressIfExists(
        address: string,
        parentDerivedKeyInfo: DerivedHDKeyInfo,
        searchLimit: number,
    ): DerivedHDKeyInfo | undefined {
        const lowercaseAddress = address.toLowerCase();
        let matchedKey: DerivedHDKeyInfo | undefined;
        const derivedKeyIterator = new DerivedHDKeyInfoIterator(parentDerivedKeyInfo, searchLimit);
        for (const key of derivedKeyIterator) {
            if (key.address === lowercaseAddress) {
                matchedKey = key;
                break;
            }
        }
        return matchedKey;
    },
    addressOfHDKey(hdKey: HDNode): string {
        const shouldSanitizePublicKey = true;
        const derivedPublicKey = hdKey.publicKey;
        const ethereumAddressUnprefixed = ethUtil
            .publicToAddress(derivedPublicKey, shouldSanitizePublicKey)
            .toString('hex');
        const address = ethUtil.addHexPrefix(ethereumAddressUnprefixed).toLowerCase();
        return address;
    },
};
