"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressUtils = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const _ = require("lodash");
const hex_utils_1 = require("./hex_utils");
const BASIC_ADDRESS_REGEX = /^(0x)?[0-9a-f]{40}$/i;
const SAME_CASE_ADDRESS_REGEX = /^(0x)?([0-9a-f]{40}|[0-9A-F]{40})$/;
const ADDRESS_LENGTH = 40;
exports.addressUtils = {
    isChecksumAddress(address) {
        return ethereumjs_util_1.isValidChecksumAddress(address);
    },
    isAddress(address) {
        if (!BASIC_ADDRESS_REGEX.test(address)) {
            // Check if it has the basic requirements of an address
            return false;
        }
        else if (SAME_CASE_ADDRESS_REGEX.test(address)) {
            // If it's all small caps or all all caps, return true
            return true;
        }
        else {
            // Otherwise check each case
            const isValidChecksummedAddress = exports.addressUtils.isChecksumAddress(address);
            return isValidChecksummedAddress;
        }
    },
    padZeros(address) {
        return ethereumjs_util_1.addHexPrefix(_.padStart(ethereumjs_util_1.stripHexPrefix(address), ADDRESS_LENGTH, '0'));
    },
    generatePseudoRandomAddress() {
        // tslint:disable-next-line: custom-no-magic-numbers
        return hex_utils_1.hexUtils.random(20);
    },
};
//# sourceMappingURL=address_utils.js.map