"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_schemas_1 = require("@0x/json-schemas");
const utils_1 = require("@0x/utils");
const chai = require("chai");
const dirtyChai = require("dirty-chai");
require("mocha");
const index_1 = require("../src/index");
chai.config.includeStack = true;
chai.use(dirtyChai);
const expect = chai.expect;
// tslint:disable:no-unnecessary-type-assertion
// tslint:disable:custom-no-magic-numbers
describe('Assertions', () => {
    const variableName = 'variable';
    describe('#isBigNumber', () => {
        it('should not throw for valid input', () => {
            const validInputs = [new utils_1.BigNumber(23), new utils_1.BigNumber('45')];
            validInputs.forEach(input => expect(index_1.assert.isBigNumber.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = ['test', 42, false, { random: 'test' }, undefined];
            invalidInputs.forEach(input => expect(index_1.assert.isBigNumber.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isNumberLike', () => {
        it('should not throw for valid input', () => {
            const validInputs = [new utils_1.BigNumber(23), 23];
            validInputs.forEach(input => expect(index_1.assert.isNumberLike.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = ['test', false, { random: 'test' }, undefined];
            invalidInputs.forEach(input => expect(index_1.assert.isNumberLike.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isValidBaseUnitAmount', () => {
        it('should not throw for valid input', () => {
            const validInputs = [new utils_1.BigNumber(23), new utils_1.BigNumber('45000000')];
            validInputs.forEach(input => expect(index_1.assert.isValidBaseUnitAmount.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [0, undefined, new utils_1.BigNumber(3.145), 3.145, new utils_1.BigNumber(-400)];
            invalidInputs.forEach(input => expect(index_1.assert.isValidBaseUnitAmount.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isString', () => {
        it('should not throw for valid input', () => {
            const validInputs = ['hello', 'goodbye'];
            validInputs.forEach(input => expect(index_1.assert.isString.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [42, false, { random: 'test' }, undefined, new utils_1.BigNumber(45)];
            invalidInputs.forEach(input => expect(index_1.assert.isString.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isFunction', () => {
        it('should not throw for valid input', () => {
            const validInputs = [utils_1.BigNumber, index_1.assert.isString.bind(index_1.assert)];
            validInputs.forEach(input => expect(index_1.assert.isFunction.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [42, false, { random: 'test' }, undefined, new utils_1.BigNumber(45)];
            invalidInputs.forEach(input => expect(index_1.assert.isFunction.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isHexString', () => {
        it('should not throw for valid input', () => {
            const validInputs = [
                '0x61a3ed31B43c8780e905a260a35faefEc527be7516aa11c0256729b5b351bc33',
                '0x40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',
            ];
            validInputs.forEach(input => expect(index_1.assert.isHexString.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [
                42,
                false,
                { random: 'test' },
                undefined,
                new utils_1.BigNumber(45),
                '0x61a3ed31B43c8780e905a260a35faYfEc527be7516aa11c0256729b5b351bc33',
            ];
            invalidInputs.forEach(input => expect(index_1.assert.isHexString.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isETHAddressHex', () => {
        it('should not throw for valid input', () => {
            const validInputs = [
                '0x0000000000000000000000000000000000000000',
                '0x6fffd0ae3f7d88c9b4925323f54c6e4b2918c5fd',
                '0x12459c951127e0c374ff9105dda097662a027093',
            ];
            validInputs.forEach(input => expect(index_1.assert.isETHAddressHex.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [
                42,
                false,
                { random: 'test' },
                undefined,
                new utils_1.BigNumber(45),
                '0x6FFFd0ae3f7d88c9b4925323f54c6e4b2918c5fd',
                '0x6FFFd0ae3f7d88c9b4925323f54c6e4',
            ];
            invalidInputs.forEach(input => expect(index_1.assert.isETHAddressHex.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#doesBelongToStringEnum', () => {
        let TestEnums;
        (function (TestEnums) {
            TestEnums["Test1"] = "Test1";
            TestEnums["Test2"] = "Test2";
        })(TestEnums || (TestEnums = {}));
        it('should not throw for valid input', () => {
            const validInputs = [TestEnums.Test1, TestEnums.Test2];
            validInputs.forEach(input => expect(index_1.assert.doesBelongToStringEnum.bind(index_1.assert, variableName, input, TestEnums)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [42, false, { random: 'test' }, undefined, new utils_1.BigNumber(45)];
            invalidInputs.forEach(input => expect(index_1.assert.doesBelongToStringEnum.bind(index_1.assert, variableName, input, TestEnums)).to.throw());
        });
    });
    describe('#hasAtMostOneUniqueValue', () => {
        const errorMsg = 'more than one unique value';
        it('should not throw for valid input', () => {
            const validInputs = [['hello'], ['goodbye', 'goodbye', 'goodbye']];
            validInputs.forEach(input => expect(index_1.assert.hasAtMostOneUniqueValue.bind(index_1.assert, input, errorMsg)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [['hello', 'goodbye'], ['goodbye', 42, false, false]];
            invalidInputs.forEach(input => expect(index_1.assert.hasAtMostOneUniqueValue.bind(index_1.assert, input, errorMsg)).to.throw());
        });
    });
    describe('#isNumber', () => {
        it('should not throw for valid input', () => {
            const validInputs = [42, 0, 21e42];
            validInputs.forEach(input => expect(index_1.assert.isNumber.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [false, { random: 'test' }, undefined, new utils_1.BigNumber(45)];
            invalidInputs.forEach(input => expect(index_1.assert.isNumber.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isBoolean', () => {
        it('should not throw for valid input', () => {
            const validInputs = [true, false];
            validInputs.forEach(input => expect(index_1.assert.isBoolean.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [42, { random: 'test' }, undefined, new utils_1.BigNumber(45)];
            invalidInputs.forEach(input => expect(index_1.assert.isBoolean.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isWeb3Provider', () => {
        it('should not throw for valid input', () => {
            const validInputs = [{ send: () => 45 }, { sendAsync: () => 45 }];
            validInputs.forEach(input => expect(index_1.assert.isWeb3Provider.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [42, { random: 'test' }, undefined, new utils_1.BigNumber(45)];
            invalidInputs.forEach(input => expect(index_1.assert.isWeb3Provider.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#doesConformToSchema', () => {
        const schema = json_schemas_1.schemas.addressSchema;
        it('should not throw for valid input', () => {
            const validInputs = [
                '0x6fffd0ae3f7d88c9b4925323f54c6e4b2918c5fd',
                '0x12459c951127e0c374ff9105dda097662a027093',
            ];
            validInputs.forEach(input => expect(index_1.assert.doesConformToSchema.bind(index_1.assert, variableName, input, schema)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [42, { random: 'test' }, undefined, new utils_1.BigNumber(45)];
            invalidInputs.forEach(input => expect(index_1.assert.doesConformToSchema.bind(index_1.assert, variableName, input, schema)).to.throw());
        });
    });
    describe('#doesMatchRegex', () => {
        const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
        it('should not throw for valid input', () => {
            const validInputs = ['2020-01-01', '2030-12-12'];
            validInputs.forEach(input => expect(index_1.assert.doesMatchRegex.bind(index_1.assert, variableName, input, DATE_REGEX)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [42, { random: 'test' }, undefined, new utils_1.BigNumber(45), '20-01-01', '20200101'];
            invalidInputs.forEach(input => expect(index_1.assert.doesMatchRegex.bind(index_1.assert, variableName, input, DATE_REGEX)).to.throw());
        });
    });
    describe('#isWebUri', () => {
        it('should not throw for valid input', () => {
            const validInputs = [
                'http://www.google.com',
                'https://api.example-relayer.net',
                'https://api.radarrelay.com/0x/v0/',
                'https://zeroex.beta.radarrelay.com:8000/0x/v0/',
            ];
            validInputs.forEach(input => expect(index_1.assert.isWebUri.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [
                42,
                { random: 'test' },
                undefined,
                new utils_1.BigNumber(45),
                'ws://www.api.example-relayer.net',
                'www.google.com',
                'api.example-relayer.net',
                'user:password@api.example-relayer.net',
                '//api.example-relayer.net',
            ];
            invalidInputs.forEach(input => expect(index_1.assert.isWebUri.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#isUri', () => {
        it('should not throw for valid input', () => {
            const validInputs = [
                'http://www.google.com',
                'https://api.example-relayer.net',
                'https://api.radarrelay.com/0x/v0/',
                'https://zeroex.beta.radarrelay.com:8000/0x/v0/',
                'ws://www.api.example-relayer.net',
                'wss://www.api.example-relayer.net',
                'user:password@api.example-relayer.net',
            ];
            validInputs.forEach(input => expect(index_1.assert.isUri.bind(index_1.assert, variableName, input)).to.not.throw());
        });
        it('should throw for invalid input', () => {
            const invalidInputs = [
                42,
                { random: 'test' },
                undefined,
                new utils_1.BigNumber(45),
                'www.google.com',
                'api.example-relayer.net',
                '//api.example-relayer.net',
            ];
            invalidInputs.forEach(input => expect(index_1.assert.isUri.bind(index_1.assert, variableName, input)).to.throw());
        });
    });
    describe('#assert', () => {
        const assertMessage = 'assert not satisfied';
        it('should not throw for valid input', () => {
            expect(index_1.assert.assert.bind(index_1.assert, true, assertMessage)).to.not.throw();
        });
        it('should throw for invalid input', () => {
            expect(index_1.assert.assert.bind(index_1.assert, false, assertMessage)).to.throw();
        });
    });
    describe('#typeAssertionMessage', () => {
        it('should render correct message', () => {
            expect(index_1.assert.typeAssertionMessage('variable', 'string', 'number')).to.equal(`Expected variable to be of type string, encountered: number`);
        });
    });
});
// tslint:enable:custom-no-magic-numbers
// tslint:enable:no-unnecessary-type-assertion
//# sourceMappingURL=assert_test.js.map