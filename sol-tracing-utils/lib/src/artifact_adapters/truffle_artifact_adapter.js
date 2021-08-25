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
exports.TruffleArtifactAdapter = void 0;
const sol_compiler_1 = require("@0x/sol-compiler");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const abstract_artifact_adapter_1 = require("./abstract_artifact_adapter");
const sol_compiler_artifact_adapter_1 = require("./sol_compiler_artifact_adapter");
const DEFAULT_TRUFFLE_ARTIFACTS_DIR = './build/contracts';
class TruffleArtifactAdapter extends abstract_artifact_adapter_1.AbstractArtifactAdapter {
    /**
     * Instantiates a TruffleArtifactAdapter
     * @param projectRoot Path to the truffle project's root directory
     * @param solcVersion Solidity version with which to compile all the contracts
     */
    constructor(projectRoot, solcVersion) {
        super();
        this._solcVersion = solcVersion;
        this._projectRoot = projectRoot;
    }
    collectContractsDataAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const artifactsDir = '.0x-artifacts';
            const contractsDir = path.join(this._projectRoot, 'contracts');
            const truffleConfig = this._getTruffleConfig();
            const solcConfig = this._getTruffleSolcSettings();
            const truffleArtifactsDirectory = truffleConfig.contracts_build_directory || DEFAULT_TRUFFLE_ARTIFACTS_DIR;
            this._assertSolidityVersionIsCorrect(truffleArtifactsDirectory);
            const compilerOptions = {
                contractsDir,
                artifactsDir,
                compilerSettings: Object.assign(Object.assign({}, solcConfig), { outputSelection: {
                        ['*']: {
                            ['*']: ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'],
                        },
                    } }),
                contracts: '*',
                solcVersion: this._solcVersion,
            };
            const compiler = new sol_compiler_1.Compiler(compilerOptions);
            yield compiler.compileAsync();
            const solCompilerArtifactAdapter = new sol_compiler_artifact_adapter_1.SolCompilerArtifactAdapter(artifactsDir, contractsDir);
            const contractsDataFrom0xArtifacts = yield solCompilerArtifactAdapter.collectContractsDataAsync();
            return contractsDataFrom0xArtifacts;
        });
    }
    _getTruffleConfig() {
        const truffleConfigFileShort = path.resolve(path.join(this._projectRoot, 'truffle.js'));
        const truffleConfigFileLong = path.resolve(path.join(this._projectRoot, 'truffle-config.js'));
        if (fs.existsSync(truffleConfigFileShort)) {
            const truffleConfig = require(truffleConfigFileShort);
            return truffleConfig;
        }
        else if (fs.existsSync(truffleConfigFileLong)) {
            const truffleConfig = require(truffleConfigFileLong);
            return truffleConfig;
        }
        else {
            throw new Error(`Neither ${truffleConfigFileShort} nor ${truffleConfigFileLong} exists. Make sure the project root is correct`);
        }
    }
    _getTruffleSolcSettings() {
        const truffleConfig = this._getTruffleConfig();
        if (truffleConfig.solc !== undefined) {
            // Truffle < 5.0
            return truffleConfig.solc;
        }
        else if (truffleConfig.compilers.solc !== undefined) {
            // Truffle >= 5.0
            return truffleConfig.compilers.solc.settings;
        }
        else {
            return {};
        }
    }
    _assertSolidityVersionIsCorrect(truffleArtifactsDirectory) {
        const artifactsGlob = `${truffleArtifactsDirectory}/**/*.json`;
        const artifactFileNames = glob.sync(artifactsGlob, { absolute: true });
        for (const artifactFileName of artifactFileNames) {
            const artifact = JSON.parse(fs.readFileSync(artifactFileName).toString());
            const compilerVersion = artifact.compiler.version;
            if (!compilerVersion.startsWith(this._solcVersion)) {
                throw new Error(`${artifact.contractName} was compiled with solidity ${compilerVersion} but specified version is ${this._solcVersion} making it impossible to process traces`);
            }
        }
    }
}
exports.TruffleArtifactAdapter = TruffleArtifactAdapter;
//# sourceMappingURL=truffle_artifact_adapter.js.map