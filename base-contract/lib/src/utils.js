"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkLibrariesInBytecode = exports.methodAbiToFunctionSignature = exports.formatABIDataItem = void 0;
const utils_1 = require("@0x/utils");
// tslint:disable-next-line:completed-docs
function formatABIDataItem(abi, value, formatter) {
    const trailingArrayRegex = /\[\d*\]$/;
    if (abi.type.match(trailingArrayRegex)) {
        const arrayItemType = abi.type.replace(trailingArrayRegex, '');
        return value.map((val) => {
            const arrayItemAbi = Object.assign(Object.assign({}, abi), { type: arrayItemType });
            return formatABIDataItem(arrayItemAbi, val, formatter);
        });
    }
    else if (abi.type === 'tuple') {
        const formattedTuple = {};
        if (abi.components) {
            abi.components.forEach(componentABI => {
                formattedTuple[componentABI.name] = formatABIDataItem(componentABI, value[componentABI.name], formatter);
            });
        }
        return formattedTuple;
    }
    else {
        return formatter(abi.type, value);
    }
}
exports.formatABIDataItem = formatABIDataItem;
/**
 * Takes a MethodAbi and returns a function signature for ABI encoding/decoding
 * @return a function signature as a string, e.g. 'functionName(uint256, bytes[])'
 */
function methodAbiToFunctionSignature(methodAbi) {
    const method = utils_1.AbiEncoder.createMethod(methodAbi.name, methodAbi.inputs);
    return method.getSignature();
}
exports.methodAbiToFunctionSignature = methodAbiToFunctionSignature;
/**
 * Replaces unliked library references in the bytecode of a contract artifact
 * with real addresses and returns the bytecode.
 */
function linkLibrariesInBytecode(artifact, libraryAddresses) {
    const bytecodeArtifact = artifact.compilerOutput.evm.bytecode;
    let bytecode = bytecodeArtifact.object.substr(2);
    for (const link of Object.values(bytecodeArtifact.linkReferences)) {
        for (const [libraryName, libraryRefs] of Object.entries(link)) {
            const libraryAddress = libraryAddresses[libraryName];
            if (!libraryAddress) {
                throw new Error(`${artifact.contractName} has an unlinked reference library ${libraryName} but no addresses was provided'.`);
            }
            for (const ref of libraryRefs) {
                bytecode = [
                    bytecode.substring(0, ref.start * 2),
                    libraryAddress.toLowerCase().substr(2),
                    bytecode.substring((ref.start + ref.length) * 2),
                ].join('');
            }
        }
    }
    return `0x${bytecode}`;
}
exports.linkLibrariesInBytecode = linkLibrariesInBytecode;
//# sourceMappingURL=utils.js.map