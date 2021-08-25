"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletUtils = void 0;
const ethUtil = require("ethereumjs-util");
const DEFAULT_ADDRESS_SEARCH_LIMIT = 1000;
class DerivedHDKeyInfoIterator {
    constructor(initialDerivedKey, searchLimit = DEFAULT_ADDRESS_SEARCH_LIMIT) {
        this._searchLimit = searchLimit;
        this._parentDerivedKeyInfo = initialDerivedKey;
        this._index = 0;
    }
    next() {
        const baseDerivationPath = this._parentDerivedKeyInfo.baseDerivationPath;
        const derivationIndex = this._index;
        let fullDerivationPath;
        if (baseDerivationPath.includes("x")) {
            fullDerivationPath = baseDerivationPath.replace("x", derivationIndex.toString(10));
        }
        else {
            fullDerivationPath = `m/${baseDerivationPath}/${derivationIndex}`;
        }
        const path = `m/${derivationIndex}`;
        const hdKey = this._parentDerivedKeyInfo.hdKey.derive(path);
        const address = exports.walletUtils.addressOfHDKey(hdKey);
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
    [Symbol.iterator]() {
        return this;
    }
}
exports.walletUtils = {
    calculateDerivedHDKeyInfos(parentDerivedKeyInfo, numberOfKeys) {
        const derivedKeys = [];
        const derivedKeyIterator = new DerivedHDKeyInfoIterator(parentDerivedKeyInfo, numberOfKeys);
        for (const key of derivedKeyIterator) {
            derivedKeys.push(key);
        }
        return derivedKeys;
    },
    findDerivedKeyInfoForAddressIfExists(address, parentDerivedKeyInfo, searchLimit) {
        const lowercaseAddress = address.toLowerCase();
        let matchedKey;
        const derivedKeyIterator = new DerivedHDKeyInfoIterator(parentDerivedKeyInfo, searchLimit);
        for (const key of derivedKeyIterator) {
            if (key.address === lowercaseAddress) {
                matchedKey = key;
                break;
            }
        }
        return matchedKey;
    },
    addressOfHDKey(hdKey) {
        const shouldSanitizePublicKey = true;
        const derivedPublicKey = hdKey.publicKey;
        const ethereumAddressUnprefixed = ethUtil
            .publicToAddress(derivedPublicKey, shouldSanitizePublicKey)
            .toString('hex');
        const address = ethUtil.addHexPrefix(ethereumAddressUnprefixed).toLowerCase();
        return address;
    },
};
//# sourceMappingURL=wallet_utils.js.map