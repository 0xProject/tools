"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encoder = void 0;
const ethereum_types_1 = require("ethereum-types");
const _ = require("lodash");
const web3Abi = require("web3-eth-abi");
exports.encoder = {
    encodeConstructorArgsFromAbi(args, abi) {
        const constructorTypes = [];
        _.each(abi, (element) => {
            if (element.type === ethereum_types_1.AbiType.Constructor) {
                // tslint:disable-next-line:no-unnecessary-type-assertion
                const constuctorAbi = element;
                _.each(constuctorAbi.inputs, (input) => {
                    constructorTypes.push(input.type);
                });
            }
        });
        const encodedParameters = web3Abi.encodeParameters(constructorTypes, args);
        return encodedParameters;
    },
};
//# sourceMappingURL=encoder.js.map