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
exports.SolcWrapperV05 = exports.DEFAULT_COMPILER_SETTINGS = void 0;
const _ = require("lodash");
const compiler_1 = require("./utils/compiler");
const solc_wrapper_1 = require("./solc_wrapper");
// Solc compiler settings cannot be configured from the commandline.
// If you need this configured, please create a `compiler.json` config file
// with your desired configurations.
exports.DEFAULT_COMPILER_SETTINGS = {
    optimizer: {
        enabled: false,
    },
    outputSelection: {
        '*': {
            '*': ['abi', 'evm.bytecode.object'],
        },
    },
};
// tslint:disable no-non-null-assertion
class SolcWrapperV05 extends solc_wrapper_1.SolcWrapper {
    constructor(_solcVersion, _opts) {
        super();
        this._solcVersion = _solcVersion;
        this._opts = _opts;
        this._compilerSettings = Object.assign(Object.assign({}, exports.DEFAULT_COMPILER_SETTINGS), _opts.compilerSettings);
    }
    get version() {
        return this._solcVersion;
    }
    get solidityVersion() {
        return compiler_1.getSolidityVersionFromSolcVersion(this._solcVersion);
    }
    areCompilerSettingsDifferent(settings) {
        return !_.isEqual(_.omit(settings, 'remappings'), _.omit(this._compilerSettings, 'remappings'));
    }
    compileAsync(contractsByPath, importRemappings) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = {
                language: 'Solidity',
                sources: {},
                settings: Object.assign({ remappings: [] }, this._compilerSettings),
            };
            for (const [contractPath, contractContent] of Object.entries(contractsByPath)) {
                input.sources[contractPath] = { content: contractContent };
            }
            for (const [prefix, _path] of Object.entries(importRemappings)) {
                input.settings.remappings.push(`${prefix}=${_path}`);
            }
            const output = yield this._compileInputAsync(input);
            if (output.errors !== undefined) {
                compiler_1.printCompilationErrorsAndWarnings(output.errors);
            }
            return {
                input,
                output: this._normalizeOutput(output),
            };
        });
    }
    _compileInputAsync(input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._opts.useDockerisedSolc) {
                return compiler_1.compileDockerAsync(this.solidityVersion, input);
            }
            const solcInstance = yield compiler_1.getSolcJSAsync(this.solidityVersion, !!this._opts.isOfflineMode);
            return compiler_1.compileSolcJSAsync(solcInstance, input);
        });
    }
    // tslint:disable-next-line: prefer-function-over-method
    _normalizeOutput(output) {
        const _output = _.cloneDeep(output);
        // tslint:disable-next-line forin
        for (const contractPath in _output.contracts) {
            for (const contract of Object.values(_output.contracts[contractPath])) {
                compiler_1.addHexPrefixToContractBytecode(contract);
            }
        }
        return _output;
    }
}
exports.SolcWrapperV05 = SolcWrapperV05;
//# sourceMappingURL=solc_wrapper_v05.js.map