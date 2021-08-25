"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structuredReturnValue = exports.mixedStaticAndDynamicReturnValues = exports.multipleDynamicReturnValues = exports.singleDynamicReturnValue = exports.multipleStaticReturnValues = exports.singleStaticReturnValue = exports.noReturnValues = void 0;
exports.noReturnValues = {
    constant: false,
    inputs: [],
    name: 'simpleFunction',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
};
exports.singleStaticReturnValue = {
    constant: false,
    inputs: [],
    name: 'simpleFunction',
    outputs: [
        {
            name: 'Bytes4',
            type: 'bytes4',
        },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
};
exports.multipleStaticReturnValues = {
    constant: false,
    inputs: [],
    name: 'simpleFunction',
    outputs: [
        {
            name: 'val1',
            type: 'bytes4',
        },
        {
            name: 'val2',
            type: 'bytes4',
        },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
};
exports.singleDynamicReturnValue = {
    constant: false,
    inputs: [],
    name: 'simpleFunction',
    outputs: [
        {
            name: 'val',
            type: 'bytes',
        },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
};
exports.multipleDynamicReturnValues = {
    constant: false,
    inputs: [],
    name: 'simpleFunction',
    outputs: [
        {
            name: 'val1',
            type: 'bytes',
        },
        {
            name: 'val2',
            type: 'bytes',
        },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
};
exports.mixedStaticAndDynamicReturnValues = {
    constant: false,
    inputs: [],
    name: 'simpleFunction',
    outputs: [
        {
            name: 'val1',
            type: 'bytes4',
        },
        {
            name: 'val2',
            type: 'bytes',
        },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
};
exports.structuredReturnValue = {
    constant: false,
    inputs: [],
    name: 'fillOrder',
    outputs: [
        {
            components: [
                {
                    name: 'makerAssetFilledAmount',
                    type: 'uint256',
                },
                {
                    name: 'takerAssetFilledAmount',
                    type: 'uint256',
                },
            ],
            name: 'fillResults',
            type: 'tuple',
        },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
};
//# sourceMappingURL=return_value_abis.js.map