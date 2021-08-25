"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawRevertError = exports.AnyRevertError = exports.StringRevertError = exports.getThrownErrorRevertErrorBytes = exports.RevertError = exports.coerceThrownErrorAsRevertError = exports.decodeThrownErrorAsRevertError = exports.decodeBytesAsRevertError = exports.registerRevertErrorType = void 0;
const ethUtil = require("ethereumjs-util");
const _ = require("lodash");
const util_1 = require("util");
const AbiEncoder = require("./abi_encoder");
const configured_bignumber_1 = require("./configured_bignumber");
/**
 * Register a RevertError type so that it can be decoded by
 * `decodeRevertError`.
 * @param revertClass A class that inherits from RevertError.
 * @param force Allow overwriting registered types.
 */
function registerRevertErrorType(revertClass, force = false) {
    RevertError.registerType(revertClass, force);
}
exports.registerRevertErrorType = registerRevertErrorType;
/**
 * Decode an ABI encoded revert error.
 * Throws if the data cannot be decoded as a known RevertError type.
 * @param bytes The ABI encoded revert error. Either a hex string or a Buffer.
 * @param coerce Coerce unknown selectors into a `RawRevertError` type.
 * @return A RevertError object.
 */
function decodeBytesAsRevertError(bytes, coerce = false) {
    return RevertError.decode(bytes, coerce);
}
exports.decodeBytesAsRevertError = decodeBytesAsRevertError;
/**
 * Decode a thrown error.
 * Throws if the data cannot be decoded as a known RevertError type.
 * @param error Any thrown error.
 * @param coerce Coerce unknown selectors into a `RawRevertError` type.
 * @return A RevertError object.
 */
function decodeThrownErrorAsRevertError(error, coerce = false) {
    if (error instanceof RevertError) {
        return error;
    }
    return RevertError.decode(getThrownErrorRevertErrorBytes(error), coerce);
}
exports.decodeThrownErrorAsRevertError = decodeThrownErrorAsRevertError;
/**
 * Coerce a thrown error into a `RevertError`. Always succeeds.
 * @param error Any thrown error.
 * @return A RevertError object.
 */
function coerceThrownErrorAsRevertError(error) {
    if (error instanceof RevertError) {
        return error;
    }
    try {
        return decodeThrownErrorAsRevertError(error, true);
    }
    catch (err) {
        if (isGanacheTransactionRevertError(error)) {
            throw err;
        }
        // Handle geth transaction reverts.
        if (isGethTransactionRevertError(error)) {
            // Geth transaction reverts are opaque, meaning no useful data is returned,
            // so we just return an AnyRevertError type.
            return new AnyRevertError();
        }
        // Coerce plain errors into a StringRevertError.
        return new StringRevertError(error.message);
    }
}
exports.coerceThrownErrorAsRevertError = coerceThrownErrorAsRevertError;
/**
 * Base type for revert errors.
 */
class RevertError extends Error {
    /**
     * Create a RevertError instance with optional parameter values.
     * Parameters that are left undefined will not be tested in equality checks.
     * @param declaration Function-style declaration of the revert (e.g., Error(string message))
     * @param values Optional mapping of parameters to values.
     * @param raw Optional encoded form of the revert error. If supplied, this
     *        instance will be treated as a `RawRevertError`, meaning it can only
     *        match other `RawRevertError` types with the same encoded payload.
     */
    constructor(name, declaration, values, raw) {
        super(createErrorMessage(name, values));
        this.values = {};
        if (declaration !== undefined) {
            this.abi = declarationToAbi(declaration);
            if (values !== undefined) {
                _.assign(this.values, _.cloneDeep(values));
            }
        }
        this._raw = raw;
        // Extending Error is tricky; we need to explicitly set the prototype.
        Object.setPrototypeOf(this, new.target.prototype);
    }
    /**
     * Decode an ABI encoded revert error.
     * Throws if the data cannot be decoded as a known RevertError type.
     * @param bytes The ABI encoded revert error. Either a hex string or a Buffer.
     * @param coerce Whether to coerce unknown selectors into a `RawRevertError` type.
     * @return A RevertError object.
     */
    static decode(bytes, coerce = false) {
        if (bytes instanceof RevertError) {
            return bytes;
        }
        const _bytes = bytes instanceof Buffer ? ethUtil.bufferToHex(bytes) : ethUtil.addHexPrefix(bytes);
        // tslint:disable-next-line: custom-no-magic-numbers
        const selector = _bytes.slice(2, 10);
        if (!(selector in RevertError._typeRegistry)) {
            if (coerce) {
                return new RawRevertError(bytes);
            }
            throw new Error(`Unknown selector: ${selector}`);
        }
        const { type, decoder } = RevertError._typeRegistry[selector];
        const instance = new type();
        try {
            Object.assign(instance, { values: decoder(_bytes) });
            instance.message = instance.toString();
            return instance;
        }
        catch (err) {
            throw new Error(`Bytes ${_bytes} cannot be decoded as a revert error of type ${instance.signature}: ${err.message}`);
        }
    }
    /**
     * Register a RevertError type so that it can be decoded by
     * `RevertError.decode`.
     * @param revertClass A class that inherits from RevertError.
     * @param force Allow overwriting existing registrations.
     */
    static registerType(revertClass, force = false) {
        const instance = new revertClass();
        if (!force && instance.selector in RevertError._typeRegistry) {
            throw new Error(`RevertError type with signature "${instance.signature}" is already registered`);
        }
        if (_.isNil(instance.abi)) {
            throw new Error(`Attempting to register a RevertError class with no ABI`);
        }
        RevertError._typeRegistry[instance.selector] = {
            type: revertClass,
            decoder: createDecoder(instance.abi),
        };
    }
    /**
     * Get the ABI name for this revert.
     */
    get name() {
        if (!_.isNil(this.abi)) {
            return this.abi.name;
        }
        return `<${this.typeName}>`;
    }
    /**
     * Get the class name of this type.
     */
    get typeName() {
        // tslint:disable-next-line: no-string-literal
        return this.constructor.name;
    }
    /**
     * Get the hex selector for this revert (without leading '0x').
     */
    get selector() {
        if (!_.isNil(this.abi)) {
            return toSelector(this.abi);
        }
        if (this._isRawType) {
            // tslint:disable-next-line: custom-no-magic-numbers
            return this._raw.slice(2, 10);
        }
        return '';
    }
    /**
     * Get the signature for this revert: e.g., 'Error(string)'.
     */
    get signature() {
        if (!_.isNil(this.abi)) {
            return toSignature(this.abi);
        }
        return '';
    }
    /**
     * Get the ABI arguments for this revert.
     */
    get arguments() {
        if (!_.isNil(this.abi)) {
            return this.abi.arguments || [];
        }
        return [];
    }
    get [Symbol.toStringTag]() {
        return this.toString();
    }
    /**
     * Compares this instance with another.
     * Fails if instances are not of the same type.
     * Only fields/values defined in both instances are compared.
     * @param other Either another RevertError instance, hex-encoded bytes, or a Buffer of the ABI encoded revert.
     * @return True if both instances match.
     */
    equals(other) {
        let _other = other;
        if (_other instanceof Buffer) {
            _other = ethUtil.bufferToHex(_other);
        }
        if (typeof _other === 'string') {
            _other = RevertError.decode(_other);
        }
        if (!(_other instanceof RevertError)) {
            return false;
        }
        // If either is of the `AnyRevertError` type, always succeed.
        if (this._isAnyType || _other._isAnyType) {
            return true;
        }
        // If either are raw types, they must match their raw data.
        if (this._isRawType || _other._isRawType) {
            return this._raw === _other._raw;
        }
        // Must be of same type.
        if (this.constructor !== _other.constructor) {
            return false;
        }
        // Must share the same parameter values if defined in both instances.
        for (const name of Object.keys(this.values)) {
            const a = this.values[name];
            const b = _other.values[name];
            if (a === b) {
                continue;
            }
            if (!_.isNil(a) && !_.isNil(b)) {
                const { type } = this._getArgumentByName(name);
                if (!checkArgEquality(type, a, b)) {
                    return false;
                }
            }
        }
        return true;
    }
    encode() {
        if (this._raw !== undefined) {
            return this._raw;
        }
        if (!this._hasAllArgumentValues) {
            throw new Error(`Instance of ${this.typeName} does not have all its parameter values set.`);
        }
        const encoder = createEncoder(this.abi);
        return encoder(this.values);
    }
    toString() {
        if (this._isRawType) {
            return `${this.constructor.name}(${this._raw})`;
        }
        const values = _.omitBy(this.values, (v) => _.isNil(v));
        // tslint:disable-next-line: forin
        for (const k in values) {
            const { type: argType } = this._getArgumentByName(k);
            if (argType === 'bytes') {
                // Try to decode nested revert errors.
                try {
                    values[k] = RevertError.decode(values[k]);
                }
                catch (err) { } // tslint:disable-line:no-empty
            }
        }
        const inner = _.isEmpty(values) ? '' : util_1.inspect(values);
        return `${this.constructor.name}(${inner})`;
    }
    _getArgumentByName(name) {
        const arg = _.find(this.arguments, (a) => a.name === name);
        if (_.isNil(arg)) {
            throw new Error(`RevertError ${this.signature} has no argument named ${name}`);
        }
        return arg;
    }
    get _isAnyType() {
        return _.isNil(this.abi) && _.isNil(this._raw);
    }
    get _isRawType() {
        return !_.isNil(this._raw);
    }
    get _hasAllArgumentValues() {
        if (_.isNil(this.abi) || _.isNil(this.abi.arguments)) {
            return false;
        }
        for (const arg of this.abi.arguments) {
            if (_.isNil(this.values[arg.name])) {
                return false;
            }
        }
        return true;
    }
}
exports.RevertError = RevertError;
// Map of types registered via `registerType`.
RevertError._typeRegistry = {};
const PARITY_TRANSACTION_REVERT_ERROR_MESSAGE = /^VM execution error/;
const GANACHE_TRANSACTION_REVERT_ERROR_MESSAGE = /^VM Exception while processing transaction: revert/;
const GETH_TRANSACTION_REVERT_ERROR_MESSAGE = /always failing transaction$/;
/**
 * Try to extract the ecnoded revert error bytes from a thrown `Error`.
 */
function getThrownErrorRevertErrorBytes(error) {
    // Handle ganache transaction reverts.
    if (isGanacheTransactionRevertError(error)) {
        // Grab the first result attached.
        const result = error.results[error.hashes[0]];
        // If a reason is provided, just wrap it in a StringRevertError
        if (result.reason !== undefined) {
            return new StringRevertError(result.reason).encode();
        }
        if (result.return !== undefined && result.return !== '0x') {
            return result.return;
        }
    }
    else if (isParityTransactionRevertError(error)) {
        // Parity returns { data: 'Reverted 0xa6bcde47...', ... }
        const { data } = error;
        const hexDataIndex = data.indexOf('0x');
        if (hexDataIndex !== -1) {
            return data.slice(hexDataIndex);
        }
    }
    else {
        // Handle geth transaction reverts.
        if (isGethTransactionRevertError(error)) {
            // Geth transaction reverts are opaque, meaning no useful data is returned,
            // so we do nothing.
        }
    }
    throw new Error(`Cannot decode thrown Error "${error.message}" as a RevertError`);
}
exports.getThrownErrorRevertErrorBytes = getThrownErrorRevertErrorBytes;
function isParityTransactionRevertError(error) {
    if (PARITY_TRANSACTION_REVERT_ERROR_MESSAGE.test(error.message) && 'code' in error && 'data' in error) {
        return true;
    }
    return false;
}
function isGanacheTransactionRevertError(error) {
    if (GANACHE_TRANSACTION_REVERT_ERROR_MESSAGE.test(error.message) && 'hashes' in error && 'results' in error) {
        return true;
    }
    return false;
}
function isGethTransactionRevertError(error) {
    return GETH_TRANSACTION_REVERT_ERROR_MESSAGE.test(error.message);
}
/**
 * RevertError type for standard string reverts.
 */
class StringRevertError extends RevertError {
    constructor(message) {
        super('StringRevertError', 'Error(string message)', { message });
    }
}
exports.StringRevertError = StringRevertError;
/**
 * Special RevertError type that matches with any other RevertError instance.
 */
class AnyRevertError extends RevertError {
    constructor() {
        super('AnyRevertError');
    }
}
exports.AnyRevertError = AnyRevertError;
/**
 * Special RevertError type that is not decoded.
 */
class RawRevertError extends RevertError {
    constructor(encoded) {
        super('RawRevertError', undefined, undefined, typeof encoded === 'string' ? encoded : ethUtil.bufferToHex(encoded));
    }
}
exports.RawRevertError = RawRevertError;
/**
 * Create an error message for a RevertError.
 * @param name The name of the RevertError.
 * @param values The values for the RevertError.
 */
function createErrorMessage(name, values) {
    if (values === undefined) {
        return `${name}()`;
    }
    const _values = _.omitBy(values, (v) => _.isNil(v));
    const inner = _.isEmpty(_values) ? '' : util_1.inspect(_values);
    return `${name}(${inner})`;
}
/**
 * Parse a solidity function declaration into a RevertErrorAbi object.
 * @param declaration Function declaration (e.g., 'foo(uint256 bar)').
 * @return A RevertErrorAbi object.
 */
function declarationToAbi(declaration) {
    let m = /^\s*([_a-z][a-z0-9_]*)\((.*)\)\s*$/i.exec(declaration);
    if (!m) {
        throw new Error(`Invalid Revert Error signature: "${declaration}"`);
    }
    const [name, args] = m.slice(1);
    const argList = _.filter(args.split(','));
    const argData = _.map(argList, (a) => {
        // Match a function parameter in the format 'TYPE ID', where 'TYPE' may be
        // an array type.
        m = /^\s*(([_a-z][a-z0-9_]*)(\[\d*\])*)\s+([_a-z][a-z0-9_]*)\s*$/i.exec(a);
        if (!m) {
            throw new Error(`Invalid Revert Error signature: "${declaration}"`);
        }
        // tslint:disable: custom-no-magic-numbers
        return {
            name: m[4],
            type: m[1],
        };
        // tslint:enable: custom-no-magic-numbers
    });
    const r = {
        type: 'error',
        name,
        arguments: _.isEmpty(argData) ? [] : argData,
    };
    return r;
}
function checkArgEquality(type, lhs, rhs) {
    // Try to compare as decoded revert errors first.
    try {
        return RevertError.decode(lhs).equals(RevertError.decode(rhs));
    }
    catch (err) {
        // no-op
    }
    if (type === 'address') {
        return normalizeAddress(lhs) === normalizeAddress(rhs);
    }
    else if (type === 'bytes' || /^bytes(\d+)$/.test(type)) {
        return normalizeBytes(lhs) === normalizeBytes(rhs);
    }
    else if (type === 'string') {
        return lhs === rhs;
    }
    else if (/\[\d*\]$/.test(type)) {
        // An array type.
        // tslint:disable: custom-no-magic-numbers
        // Arguments must be arrays and have the same dimensions.
        if (lhs.length !== rhs.length) {
            return false;
        }
        const m = /^(.+)\[(\d*)\]$/.exec(type);
        const baseType = m[1];
        const isFixedLength = m[2].length !== 0;
        if (isFixedLength) {
            const length = parseInt(m[2], 10);
            // Fixed-size arrays have a fixed dimension.
            if (lhs.length !== length) {
                return false;
            }
        }
        // Recurse into sub-elements.
        for (const [slhs, srhs] of _.zip(lhs, rhs)) {
            if (!checkArgEquality(baseType, slhs, srhs)) {
                return false;
            }
        }
        return true;
        // tslint:enable: no-magic-numbers
    }
    // tslint:disable-next-line
    return new configured_bignumber_1.BigNumber(lhs || 0).eq(rhs);
}
function normalizeAddress(addr) {
    const ADDRESS_SIZE = 20;
    return ethUtil.bufferToHex(ethUtil.setLengthLeft(ethUtil.toBuffer(ethUtil.addHexPrefix(addr)), ADDRESS_SIZE));
}
function normalizeBytes(bytes) {
    return ethUtil.addHexPrefix(bytes).toLowerCase();
}
function createEncoder(abi) {
    const encoder = AbiEncoder.createMethod(abi.name, abi.arguments || []);
    return (values) => {
        const valuesArray = _.map(abi.arguments, (arg) => values[arg.name]);
        return encoder.encode(valuesArray);
    };
}
function createDecoder(abi) {
    const encoder = AbiEncoder.createMethod(abi.name, abi.arguments || []);
    return (hex) => {
        return encoder.decode(hex);
    };
}
function toSignature(abi) {
    const argTypes = _.map(abi.arguments, (a) => a.type);
    const args = argTypes.join(',');
    return `${abi.name}(${args})`;
}
function toSelector(abi) {
    return (ethUtil
        .keccak256(Buffer.from(toSignature(abi)))
        // tslint:disable-next-line: custom-no-magic-numbers
        .slice(0, 4)
        .toString('hex'));
}
// Register StringRevertError
RevertError.registerType(StringRevertError);
// tslint:disable-next-line max-file-line-count
//# sourceMappingURL=revert_error.js.map