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
exports.SolCompilerArtifactAdapter = void 0;
const sol_resolver_1 = require("@0x/sol-resolver");
const utils_1 = require("@0x/utils");
const fs = require("fs");
const glob = require("glob");
const _ = require("lodash");
const path = require("path");
const abstract_artifact_adapter_1 = require("./abstract_artifact_adapter");
const CONFIG_FILE = 'compiler.json';
class SolCompilerArtifactAdapter extends abstract_artifact_adapter_1.AbstractArtifactAdapter {
    /**
     * Instantiates a SolCompilerArtifactAdapter
     * @param artifactsPath Path to your artifacts directory
     * @param sourcesPath Path to your contract sources directory
     */
    constructor(artifactsPath, sourcesPath) {
        super();
        const config = fs.existsSync(CONFIG_FILE)
            ? JSON.parse(fs.readFileSync(CONFIG_FILE).toString())
            : {};
        if (artifactsPath === undefined && config.artifactsDir === undefined) {
            throw new Error(`artifactsDir not found in ${CONFIG_FILE}`);
        }
        this._artifactsPath = (artifactsPath || config.artifactsDir);
        if (sourcesPath === undefined && config.contractsDir === undefined) {
            throw new Error(`contractsDir not found in ${CONFIG_FILE}`);
        }
        this._sourcesPath = (sourcesPath || config.contractsDir);
        this._resolver = new sol_resolver_1.FallthroughResolver();
        this._resolver.appendResolver(new sol_resolver_1.URLResolver());
        const packagePath = path.resolve('');
        this._resolver.appendResolver(new sol_resolver_1.NPMResolver(packagePath));
        this._resolver.appendResolver(new sol_resolver_1.RelativeFSResolver(this._sourcesPath));
        this._resolver.appendResolver(new sol_resolver_1.FSResolver());
        this._resolver.appendResolver(new sol_resolver_1.NameResolver(this._sourcesPath));
    }
    collectContractsDataAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const artifactsGlob = `${this._artifactsPath}/**/*.json`;
            const artifactFileNames = glob.sync(artifactsGlob, { absolute: true });
            const contractsData = [];
            for (const artifactFileName of artifactFileNames) {
                const artifact = JSON.parse(fs.readFileSync(artifactFileName).toString());
                if (artifact.compilerOutput === undefined || artifact.compilerOutput.evm === undefined) {
                    utils_1.logUtils.warn(`${artifactFileName} doesn't contain bytecode. Skipping...`);
                    continue;
                }
                const sources = {};
                const sourceCodes = {};
                _.map(artifact.sources, (value, relativeFilePath) => {
                    const source = this._resolver.resolve(relativeFilePath);
                    sources[value.id] = source.absolutePath;
                    sourceCodes[value.id] = source.source;
                });
                const contractData = {
                    name: artifact.contractName,
                    sourceCodes,
                    sources,
                    bytecode: artifact.compilerOutput.evm.bytecode.object,
                    sourceMap: artifact.compilerOutput.evm.bytecode.sourceMap,
                    runtimeBytecode: artifact.compilerOutput.evm.deployedBytecode.object,
                    sourceMapRuntime: artifact.compilerOutput.evm.deployedBytecode.sourceMap,
                };
                const isInterfaceContract = contractData.bytecode === '0x' && contractData.runtimeBytecode === '0x';
                if (isInterfaceContract) {
                    continue;
                }
                contractsData.push(contractData);
            }
            return contractsData;
        });
    }
}
exports.SolCompilerArtifactAdapter = SolCompilerArtifactAdapter;
//# sourceMappingURL=sol_compiler_artifact_adapter.js.map