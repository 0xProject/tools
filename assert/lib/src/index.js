"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = void 0;
const json_schemas_1 = require("@0x/json-schemas");
const utils_1 = require("@0x/utils");
const _ = require("lodash");
const validUrl = require("valid-url");
const HEX_REGEX = /^0x[0-9A-F]*$/i;
const schemaValidator = new json_schemas_1.SchemaValidator();
exports.assert = {
    isBigNumber(variableName, value) {
        const isBigNumber = utils_1.BigNumber.isBigNumber(value);
        exports.assert.assert(isBigNumber, exports.assert.typeAssertionMessage(variableName, 'BigNumber', value));
    },
    isNumberLike(variableName, value) {
        const isBigNumber = utils_1.BigNumber.isBigNumber(value);
        const isNumber = typeof value === 'number';
        exports.assert.assert(isBigNumber || isNumber, exports.assert.typeAssertionMessage(variableName, 'BigNumber | number', value));
    },
    isValidBaseUnitAmount(variableName, value) {
        exports.assert.isBigNumber(variableName, value);
        const isNegative = value.isLessThan(0);
        exports.assert.assert(!isNegative, `${variableName} cannot be a negative number, found value: ${value.toNumber()}`);
        const hasDecimals = value.decimalPlaces() !== 0;
        exports.assert.assert(!hasDecimals, `${variableName} should be in baseUnits (no decimals), found value: ${value.toNumber()}`);
    },
    isString(variableName, value) {
        exports.assert.assert(_.isString(value), exports.assert.typeAssertionMessage(variableName, 'string', value));
    },
    isFunction(variableName, value) {
        exports.assert.assert(_.isFunction(value), exports.assert.typeAssertionMessage(variableName, 'function', value));
    },
    isHexString(variableName, value) {
        exports.assert.assert(_.isString(value) && HEX_REGEX.test(value), exports.assert.typeAssertionMessage(variableName, 'HexString', value));
    },
    isETHAddressHex(variableName, value) {
        exports.assert.assert(_.isString(value), exports.assert.typeAssertionMessage(variableName, 'string', value));
        exports.assert.assert(utils_1.addressUtils.isAddress(value), exports.assert.typeAssertionMessage(variableName, 'ETHAddressHex', value));
    },
    doesBelongToStringEnum(variableName, value, stringEnum /* There is no base type for every string enum */) {
        const enumValues = _.values(stringEnum);
        const doesBelongToStringEnum = _.includes(enumValues, value);
        const enumValuesAsStrings = _.map(enumValues, enumValue => `'${enumValue}'`);
        const enumValuesAsString = enumValuesAsStrings.join(', ');
        exports.assert.assert(doesBelongToStringEnum, `Expected ${variableName} to be one of: ${enumValuesAsString}, encountered: ${value}`);
    },
    hasAtMostOneUniqueValue(value, errMsg) {
        exports.assert.assert(_.uniq(value).length <= 1, errMsg);
    },
    isNumber(variableName, value) {
        exports.assert.assert(_.isFinite(value), exports.assert.typeAssertionMessage(variableName, 'number', value));
    },
    isNumberOrBigNumber(variableName, value) {
        if (_.isFinite(value)) {
            return;
        }
        else {
            exports.assert.assert(utils_1.BigNumber.isBigNumber(value), exports.assert.typeAssertionMessage(variableName, 'number or BigNumber', value));
        }
    },
    isBoolean(variableName, value) {
        exports.assert.assert(_.isBoolean(value), exports.assert.typeAssertionMessage(variableName, 'boolean', value));
    },
    isWeb3Provider(variableName, value) {
        utils_1.logUtils.warn('DEPRECATED: Please use providerUtils.standardizeOrThrow() instead');
        const isWeb3Provider = _.isFunction(value.send) || _.isFunction(value.sendAsync);
        exports.assert.assert(isWeb3Provider, exports.assert.typeAssertionMessage(variableName, 'Provider', value));
    },
    doesConformToSchema(variableName, value, schema, subSchemas) {
        if (value === undefined) {
            throw new Error(`${variableName} can't be undefined`);
        }
        if (subSchemas !== undefined) {
            schemaValidator.addSchema(subSchemas);
        }
        const validationResult = schemaValidator.validate(value, schema);
        const hasValidationErrors = validationResult.errors && validationResult.errors.length > 0;
        const msg = hasValidationErrors
            ? `Expected ${variableName} to conform to schema ${schema.id}
Encountered: ${JSON.stringify(value, null, '\t')}
Validation errors: ${validationResult.errors.join(', ')}`
            : '';
        exports.assert.assert(!hasValidationErrors, msg);
    },
    doesMatchRegex(variableName, value, regex) {
        exports.assert.assert(regex.test(value), exports.assert.typeAssertionMessage(variableName, String(regex), value));
    },
    isWebUri(variableName, value) {
        const isValidUrl = validUrl.isWebUri(value) !== undefined;
        exports.assert.assert(isValidUrl, exports.assert.typeAssertionMessage(variableName, 'web uri', value));
    },
    isUri(variableName, value) {
        const isValidUri = validUrl.isUri(value) !== undefined;
        exports.assert.assert(isValidUri, exports.assert.typeAssertionMessage(variableName, 'uri', value));
    },
    isBlockParam(variableName, value) {
        if (Number.isInteger(value) && value >= 0) {
            return;
        }
        if (value === 'earliest' || value === 'latest' || value === 'pending') {
            return;
        }
        throw new Error(exports.assert.typeAssertionMessage(variableName, 'BlockParam', value));
    },
    isArray(variableName, value) {
        if (!Array.isArray(value)) {
            throw new Error(exports.assert.typeAssertionMessage(variableName, 'Array', value));
        }
    },
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    },
    typeAssertionMessage(variableName, type, value) {
        return `Expected ${variableName} to be of type ${type}, encountered: ${value}`;
    },
};
//# sourceMappingURL=index.js.map