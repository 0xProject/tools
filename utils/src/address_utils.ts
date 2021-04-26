import { addHexPrefix, isValidChecksumAddress, stripHexPrefix } from 'ethereumjs-util';
import { hexUtils } from './hex_utils';
import * as _ from 'lodash';

const BASIC_ADDRESS_REGEX = /^(0x)?[0-9a-f]{40}$/i;
const SAME_CASE_ADDRESS_REGEX = /^(0x)?([0-9a-f]{40}|[0-9A-F]{40})$/;
const ADDRESS_LENGTH = 40;

export const addressUtils = {
    isChecksumAddress(address: string): boolean {
        return isValidChecksumAddress(address);
    },
    isAddress(address: string): boolean {
        if (!BASIC_ADDRESS_REGEX.test(address)) {
            // Check if it has the basic requirements of an address
            return false;
        } else if (SAME_CASE_ADDRESS_REGEX.test(address)) {
            // If it's all small caps or all all caps, return true
            return true;
        } else {
            // Otherwise check each case
            const isValidChecksummedAddress = addressUtils.isChecksumAddress(address);
            return isValidChecksummedAddress;
        }
    },
    padZeros(address: string): string {
        return addHexPrefix(_.padStart(stripHexPrefix(address), ADDRESS_LENGTH, '0'));
    },
    generatePseudoRandomAddress(): string {
        return hexUtils.random(20);
    },
};
