/// <reference types="node" />
import { Numberish } from './types';
export declare const hexUtils: {
    concat: typeof concat;
    random: typeof random;
    leftPad: typeof leftPad;
    rightPad: typeof rightPad;
    invert: typeof invert;
    slice: typeof slice;
    hash: typeof hash;
    size: typeof size;
    toHex: typeof toHex;
    isHex: typeof isHex;
};
/**
 * Concatenate all arguments as a hex string.
 */
declare function concat(...args: Array<string | number | Buffer>): string;
/**
 * Generate a random hex string.
 */
declare function random(_size?: number): string;
/**
 * Left-pad a hex number to a number of bytes.
 */
declare function leftPad(n: Numberish, _size?: number): string;
/**
 * Right-pad a hex number to a number of bytes.
 */
declare function rightPad(n: Numberish, _size?: number): string;
/**
 * Inverts a hex word.
 */
declare function invert(n: Numberish, _size?: number): string;
/**
 * Slices a hex number.
 */
declare function slice(n: Numberish, start: number, end?: number): string;
/**
 * Get the keccak hash of some data.
 */
declare function hash(n: Numberish): string;
/**
 * Get the length, in bytes, of a hex string.
 */
declare function size(hex: string): number;
/**
 * Convert a string, a number, a Buffer, or a BigNumber into a hex string.
 * Works with negative numbers, as well.
 */
declare function toHex(n: Numberish | Buffer, _size?: number): string;
/**
 * Check if a string is a hex string.
 */
declare function isHex(s: string): boolean;
export {};
//# sourceMappingURL=hex_utils.d.ts.map