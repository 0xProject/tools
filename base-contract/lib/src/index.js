"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseContract = exports.PromiseWithTransactionHash = exports.SubscriptionErrors = exports.SubscriptionManager = exports.methodAbiToFunctionSignature = exports.linkLibrariesInBytecode = void 0;
const assert_1 = require("@0x/assert");
const json_schemas_1 = require("@0x/json-schemas");
const utils_1 = require("@0x/utils");
const web3_wrapper_1 = require("@0x/web3-wrapper");
const ethereum_types_1 = require("ethereum-types");
const ethereumjs_account_1 = require("ethereumjs-account");
const util = require("ethereumjs-util");
const ethereumjs_vm_1 = require("ethereumjs-vm");
const promisified_1 = require("ethereumjs-vm/dist/state/promisified");
var utils_2 = require("./utils");
Object.defineProperty(exports, "linkLibrariesInBytecode", { enumerable: true, get: function () { return utils_2.linkLibrariesInBytecode; } });
Object.defineProperty(exports, "methodAbiToFunctionSignature", { enumerable: true, get: function () { return utils_2.methodAbiToFunctionSignature; } });
const utils_3 = require("./utils");
var subscription_manager_1 = require("./subscription_manager");
Object.defineProperty(exports, "SubscriptionManager", { enumerable: true, get: function () { return subscription_manager_1.SubscriptionManager; } });
var types_1 = require("./types");
Object.defineProperty(exports, "SubscriptionErrors", { enumerable: true, get: function () { return types_1.SubscriptionErrors; } });
const ARBITRARY_PRIVATE_KEY = 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109';
// tslint:disable: max-classes-per-file
/**
 * @dev A promise-compatible type that exposes a `txHash` field.
 *      Not used by BaseContract, but generated contracts will return it in
 *      `awaitTransactionSuccessAsync()`.
 *      Maybe there's a better place for this.
 */
class PromiseWithTransactionHash {
    constructor(txHashPromise, promise) {
        this.txHashPromise = txHashPromise;
        this._promise = promise;
    }
    // tslint:disable:promise-function-async
    // tslint:disable:async-suffix
    then(onFulfilled, onRejected) {
        return this._promise.then(onFulfilled, onRejected);
    }
    catch(onRejected) {
        return this._promise.catch(onRejected);
    }
    finally(onFinally) {
        return this._promise.finally(onFinally);
    }
    // tslint:enable:promise-function-async
    // tslint:enable:async-suffix
    get [Symbol.toStringTag]() {
        return this._promise[Symbol.toStringTag];
    }
}
exports.PromiseWithTransactionHash = PromiseWithTransactionHash;
class BaseContract {
    /// @dev Constructs a contract wrapper.
    /// @param contractName Name of contract.
    /// @param abi of the contract.
    /// @param address of the deployed contract.
    /// @param supportedProvider for communicating with an ethereum node.
    /// @param logDecodeDependencies the name and ABI of contracts whose event logs are
    ///        decoded by this wrapper.
    /// @param deployedBytecode the deployedBytecode of the contract, used for executing
    ///        pure Solidity functions in memory. This is different from the bytecode.
    constructor(contractName, abi, address, supportedProvider, callAndTxnDefaults, logDecodeDependencies, deployedBytecode, encoderOverrides) {
        this.constructorArgs = [];
        assert_1.assert.isString('contractName', contractName);
        assert_1.assert.isETHAddressHex('address', address);
        if (deployedBytecode !== undefined && deployedBytecode !== '') {
            // `deployedBytecode` might contain references to
            // unlinked libraries and, hence, would not be a hex string. We'll just
            // leave `_deployedBytecodeIfExists` empty if this is the case.
            // TODO(dorothy-zbornak): We should link the `deployedBytecode`
            // beforehand in the generated wrappers.
            try {
                assert_1.assert.isHexString('deployedBytecode', deployedBytecode);
                this._deployedBytecodeIfExists = Buffer.from(deployedBytecode.substr(2), 'hex');
            }
            catch (err) {
                // Do nothing.
            }
        }
        const provider = utils_1.providerUtils.standardizeOrThrow(supportedProvider);
        if (callAndTxnDefaults !== undefined) {
            assert_1.assert.doesConformToSchema('callAndTxnDefaults', callAndTxnDefaults, json_schemas_1.schemas.callDataSchema);
        }
        this.contractName = contractName;
        this._web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider, callAndTxnDefaults);
        this._encoderOverrides = encoderOverrides || {};
        this.abi = abi;
        this.address = address;
        const methodAbis = this.abi.filter((abiDefinition) => abiDefinition.type === ethereum_types_1.AbiType.Function);
        this._abiEncoderByFunctionSignature = {};
        methodAbis.forEach(methodAbi => {
            const abiEncoder = new utils_1.AbiEncoder.Method(methodAbi);
            const functionSignature = abiEncoder.getSignature();
            this._abiEncoderByFunctionSignature[functionSignature] = abiEncoder;
            this._web3Wrapper.abiDecoder.addABI(abi, contractName);
        });
        if (logDecodeDependencies) {
            Object.entries(logDecodeDependencies).forEach(([dependencyName, dependencyAbi]) => this._web3Wrapper.abiDecoder.addABI(dependencyAbi, dependencyName));
        }
    }
    static _formatABIDataItemList(abis, values, formatter) {
        return values.map((value, i) => utils_3.formatABIDataItem(abis[i], value, formatter));
    }
    static _lowercaseAddress(type, value) {
        return type === 'address' ? value.toLowerCase() : value;
    }
    static _bigNumberToString(_type, value) {
        return utils_1.BigNumber.isBigNumber(value) ? value.toString() : value;
    }
    static _lookupConstructorAbi(abi) {
        const constructorAbiIfExists = abi.find((abiDefinition) => abiDefinition.type === ethereum_types_1.AbiType.Constructor);
        if (constructorAbiIfExists !== undefined) {
            return constructorAbiIfExists;
        }
        else {
            // If the constructor is not explicitly defined, it won't be included in the ABI. It is
            // still callable however, so we construct what the ABI would look like were it to exist.
            const defaultConstructorAbi = {
                type: ethereum_types_1.AbiType.Constructor,
                stateMutability: 'nonpayable',
                payable: false,
                inputs: [],
            };
            return defaultConstructorAbi;
        }
    }
    static _throwIfCallResultIsRevertError(rawCallResult) {
        // Try to decode the call result as a revert error.
        let revert;
        try {
            revert = utils_1.decodeBytesAsRevertError(rawCallResult);
        }
        catch (err) {
            // Can't decode it as a revert error, so assume it didn't revert.
            return;
        }
        throw revert;
    }
    static _throwIfThrownErrorIsRevertError(error) {
        // Try to decode a thrown error.
        let revertError;
        try {
            revertError = utils_1.decodeThrownErrorAsRevertError(error);
        }
        catch (err) {
            // Can't decode it.
            return;
        }
        // Re-cast StringRevertErrors as plain Errors for backwards-compatibility.
        if (revertError instanceof utils_1.StringRevertError) {
            throw new Error(revertError.values.message);
        }
        throw revertError;
    }
    static _throwIfUnexpectedEmptyCallResult(rawCallResult, methodAbi) {
        // With live nodes, we will receive an empty call result if:
        // 1. The function has no return value.
        // 2. The contract reverts without data.
        // 3. The contract reverts with an invalid opcode (`assert(false)` or `invalid()`).
        if (!rawCallResult || rawCallResult === '0x') {
            const returnValueDataItem = methodAbi.getReturnValueDataItem();
            if (returnValueDataItem.components === undefined || returnValueDataItem.components.length === 0) {
                // Expected no result (which makes it hard to tell if the call reverted).
                return;
            }
            throw new Error(`Function "${methodAbi.getSignature()}" reverted with no data`);
        }
    }
    // Throws if the given arguments cannot be safely/correctly encoded based on
    // the given inputAbi. An argument may not be considered safely encodeable
    // if it overflows the corresponding Solidity type, there is a bug in the
    // encoder, or the encoder performs unsafe type coercion.
    static strictArgumentEncodingCheck(inputAbi, args) {
        const abiEncoder = utils_1.AbiEncoder.create(inputAbi);
        const params = utils_1.abiUtils.parseEthersParams(inputAbi);
        const rawEncoded = abiEncoder.encode(args);
        const rawDecoded = abiEncoder.decodeAsArray(rawEncoded);
        for (let i = 0; i < rawDecoded.length; i++) {
            const original = args[i];
            const decoded = rawDecoded[i];
            if (!utils_1.abiUtils.isAbiDataEqual(params.names[i], params.types[i], original, decoded)) {
                throw new Error(`Cannot safely encode argument: ${params.names[i]} (${original}) of type ${params.types[i]}. (Possible type overflow or other encoding error)`);
            }
        }
        return rawEncoded;
    }
    static _applyDefaultsToContractTxDataAsync(txData, estimateGasAsync) {
        return __awaiter(this, void 0, void 0, function* () {
            const txDataWithDefaults = BaseContract._removeUndefinedProperties(txData);
            if (txDataWithDefaults.gas === undefined && estimateGasAsync !== undefined) {
                txDataWithDefaults.gas = yield estimateGasAsync(txDataWithDefaults);
            }
            if (txDataWithDefaults.from !== undefined) {
                txDataWithDefaults.from = txDataWithDefaults.from.toLowerCase();
            }
            return txDataWithDefaults;
        });
    }
    static _assertCallParams(callData, defaultBlock) {
        assert_1.assert.doesConformToSchema('callData', callData, json_schemas_1.schemas.callDataSchema);
        if (defaultBlock !== undefined) {
            assert_1.assert.isBlockParam('defaultBlock', defaultBlock);
        }
    }
    static _removeUndefinedProperties(props) {
        const clonedProps = Object.assign({}, props);
        Object.keys(clonedProps).forEach(key => clonedProps[key] === undefined && delete clonedProps[key]);
        return clonedProps;
    }
    _promiseWithTransactionHash(txHashPromise, opts) {
        return new PromiseWithTransactionHash(txHashPromise, (() => __awaiter(this, void 0, void 0, function* () {
            // When the transaction hash resolves, wait for it to be mined.
            return this._web3Wrapper.awaitTransactionSuccessAsync(yield txHashPromise, opts.pollingIntervalMs, opts.timeoutMs);
        }))());
    }
    _applyDefaultsToTxDataAsync(txData, estimateGasAsync) {
        return __awaiter(this, void 0, void 0, function* () {
            // Gas amount sourced with the following priorities:
            // 1. Optional param passed in to public method call
            // 2. Global config passed in at library instantiation
            // 3. Gas estimate calculation + safety margin
            // tslint:disable-next-line:no-object-literal-type-assertion
            const txDataWithDefaults = Object.assign(Object.assign({ to: this.address }, this._web3Wrapper.getContractDefaults()), BaseContract._removeUndefinedProperties(txData));
            if (txDataWithDefaults.gas === undefined && estimateGasAsync !== undefined) {
                txDataWithDefaults.gas = yield estimateGasAsync(txDataWithDefaults);
            }
            if (txDataWithDefaults.from !== undefined) {
                txDataWithDefaults.from = txDataWithDefaults.from.toLowerCase();
            }
            return txDataWithDefaults;
        });
    }
    _evmExecAsync(encodedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const encodedDataBytes = Buffer.from(encodedData.substr(2), 'hex');
            const addressBuf = Buffer.from(this.address.substr(2), 'hex');
            // should only run once, the first time it is called
            if (this._evmIfExists === undefined) {
                const vm = new ethereumjs_vm_1.default({});
                const psm = new promisified_1.default(vm.stateManager);
                // create an account with 1 ETH
                const accountPk = Buffer.from(ARBITRARY_PRIVATE_KEY, 'hex');
                const accountAddress = util.privateToAddress(accountPk);
                const account = new ethereumjs_account_1.default({ balance: 1e18 });
                yield psm.putAccount(accountAddress, account);
                // 'deploy' the contract
                if (this._deployedBytecodeIfExists === undefined) {
                    const contractCode = yield this._web3Wrapper.getContractCodeAsync(this.address);
                    this._deployedBytecodeIfExists = Buffer.from(contractCode.substr(2), 'hex');
                }
                yield psm.putContractCode(addressBuf, this._deployedBytecodeIfExists);
                // save for later
                this._evmIfExists = vm;
                this._evmAccountIfExists = accountAddress;
            }
            let rawCallResult;
            try {
                const result = yield this._evmIfExists.runCall({
                    to: addressBuf,
                    caller: this._evmAccountIfExists,
                    origin: this._evmAccountIfExists,
                    data: encodedDataBytes,
                });
                rawCallResult = `0x${result.execResult.returnValue.toString('hex')}`;
            }
            catch (err) {
                BaseContract._throwIfThrownErrorIsRevertError(err);
                throw err;
            }
            BaseContract._throwIfCallResultIsRevertError(rawCallResult);
            return rawCallResult;
        });
    }
    _performCallAsync(callData, defaultBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            const callDataWithDefaults = yield this._applyDefaultsToTxDataAsync(callData);
            let rawCallResult;
            try {
                rawCallResult = yield this._web3Wrapper.callAsync(callDataWithDefaults, defaultBlock);
            }
            catch (err) {
                BaseContract._throwIfThrownErrorIsRevertError(err);
                throw err;
            }
            BaseContract._throwIfCallResultIsRevertError(rawCallResult);
            return rawCallResult;
        });
    }
    _lookupAbiEncoder(functionSignature) {
        const abiEncoder = this._abiEncoderByFunctionSignature[functionSignature];
        if (abiEncoder === undefined) {
            throw new Error(`Failed to lookup method with function signature '${functionSignature}'`);
        }
        return abiEncoder;
    }
    _lookupAbi(functionSignature) {
        const methodAbi = this.abi.find((abiDefinition) => {
            if (abiDefinition.type !== ethereum_types_1.AbiType.Function) {
                return false;
            }
            // tslint:disable-next-line:no-unnecessary-type-assertion
            const abiFunctionSignature = new utils_1.AbiEncoder.Method(abiDefinition).getSignature();
            if (abiFunctionSignature === functionSignature) {
                return true;
            }
            return false;
        });
        return methodAbi;
    }
    _strictEncodeArguments(functionSignature, functionArguments) {
        if (this._encoderOverrides.encodeInput) {
            return this._encoderOverrides.encodeInput(functionSignature.split('(')[0], functionArguments);
        }
        const abiEncoder = this._lookupAbiEncoder(functionSignature);
        const inputAbi = abiEncoder.getDataItem().components;
        if (inputAbi === undefined) {
            throw new Error(`Undefined Method Input ABI`);
        }
        const abiEncodedArguments = abiEncoder.encode(functionArguments);
        return abiEncodedArguments;
    }
}
exports.BaseContract = BaseContract;
//# sourceMappingURL=index.js.map