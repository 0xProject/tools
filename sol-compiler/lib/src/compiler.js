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
exports.Compiler = exports.ALL_FILES_IDENTIFIER = exports.ALL_CONTRACTS_IDENTIFIER = void 0;
const assert_1 = require("@0x/assert");
const sol_resolver_1 = require("@0x/sol-resolver");
const utils_1 = require("@0x/utils");
const chokidar = require("chokidar");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const pluralize = require("pluralize");
const semver = require("semver");
const util_1 = require("util");
const compiler_options_schema_1 = require("./schemas/compiler_options_schema");
const compiler_1 = require("./utils/compiler");
const constants_1 = require("./utils/constants");
const fs_wrapper_1 = require("./utils/fs_wrapper");
const utils_2 = require("./utils/utils");
const solc_wrapper_v04_1 = require("./solc_wrapper_v04");
const solc_wrapper_v05_1 = require("./solc_wrapper_v05");
const solc_wrapper_v06_1 = require("./solc_wrapper_v06");
const solc_wrapper_v07_1 = require("./solc_wrapper_v07");
const solc_wrapper_v08_1 = require("./solc_wrapper_v08");
exports.ALL_CONTRACTS_IDENTIFIER = '*';
exports.ALL_FILES_IDENTIFIER = '*';
const DEFAULT_COMPILER_OPTS = {
    contractsDir: path.resolve('contracts'),
    artifactsDir: path.resolve('artifacts'),
    contracts: exports.ALL_CONTRACTS_IDENTIFIER,
    useDockerisedSolc: false,
    isOfflineMode: false,
    shouldSaveStandardInput: false,
    shouldCompileIndependently: false,
};
// tslint:disable no-non-null-assertion
/**
 * The Compiler facilitates compiling Solidity smart contracts and saves the results
 * to artifact files.
 */
class Compiler {
    /**
     * Instantiates a new instance of the Compiler class.
     * @param opts Optional compiler options
     * @return An instance of the Compiler class.
     */
    constructor(opts = {}) {
        this._solcWrappersByVersion = {};
        this._opts = Object.assign(Object.assign({}, DEFAULT_COMPILER_OPTS), opts);
        assert_1.assert.doesConformToSchema('opts', this._opts, compiler_options_schema_1.compilerOptionsSchema);
        this._contractsDir = path.resolve(this._opts.contractsDir);
        this._solcVersionIfExists =
            process.env.SOLCJS_PATH !== undefined
                ? compiler_1.getSolcJSVersionFromPath(process.env.SOLCJS_PATH)
                : this._opts.solcVersion;
        this._artifactsDir = this._opts.artifactsDir;
        this._specifiedContracts = this._opts.contracts;
        this._isOfflineMode = this._opts.isOfflineMode;
        this._shouldSaveStandardInput = this._opts.shouldSaveStandardInput;
        this._shouldCompileIndependently = this._opts.shouldCompileIndependently;
        this._nameResolver = new sol_resolver_1.NameResolver(this._contractsDir);
        this._resolver = Compiler._createDefaultResolver(this._contractsDir, this._nameResolver);
    }
    static getCompilerOptionsAsync(overrides = {}, file = 'compiler.json') {
        return __awaiter(this, void 0, void 0, function* () {
            const fileConfig = (yield util_1.promisify(fs.stat)(file)).isFile()
                ? JSON.parse((yield util_1.promisify(fs.readFile)(file, 'utf8')).toString())
                : {};
            assert_1.assert.doesConformToSchema('compiler.json', fileConfig, compiler_options_schema_1.compilerOptionsSchema);
            return Object.assign(Object.assign({}, fileConfig), overrides);
        });
    }
    static _createDefaultResolver(contractsDir, 
    // tslint:disable-next-line: trailing-comma
    ...appendedResolvers) {
        const resolver = new sol_resolver_1.FallthroughResolver();
        resolver.appendResolver(new sol_resolver_1.URLResolver());
        resolver.appendResolver(new sol_resolver_1.NPMResolver(contractsDir));
        resolver.appendResolver(new sol_resolver_1.RelativeFSResolver(contractsDir));
        resolver.appendResolver(new sol_resolver_1.FSResolver());
        for (const appendedResolver of appendedResolvers) {
            resolver.appendResolver(appendedResolver);
        }
        return resolver;
    }
    /**
     * Compiles selected Solidity files found in `contractsDir` and writes JSON artifacts to `artifactsDir`.
     */
    compileAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield compiler_1.createDirIfDoesNotExistAsync(this._artifactsDir);
            yield compiler_1.createDirIfDoesNotExistAsync(constants_1.constants.SOLC_BIN_DIR);
            yield this._compileContractsAsync(this.getContractNamesToCompile(), {
                shouldPersist: true,
                shouldCompileIndependently: this._shouldCompileIndependently,
            });
        });
    }
    /**
     * Compiles Solidity files specified during instantiation, and returns the
     * compiler output given by solc.  Return value is an array of outputs:
     * Solidity modules are batched together by version required, and each
     * element of the returned array corresponds to a compiler version, and
     * each element contains the output for all of the modules compiled with
     * that version.
     */
    getCompilerOutputsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const promisedOutputs = yield this._compileContractsAsync(this.getContractNamesToCompile(), {
                shouldPersist: false,
                shouldCompileIndependently: false,
            });
            // Batching is disabled so only the first unit for each version is used.
            return promisedOutputs.map(o => o[0]);
        });
    }
    /**
     * Watch contracts in the current project directory and recompile on changes.
     */
    watchAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.clear(); // tslint:disable-line:no-console
            utils_1.logUtils.logWithTime('Starting compilation in watch mode...');
            const MATCH_NOTHING_REGEX = '^$';
            const IGNORE_DOT_FILES_REGEX = /(^|[\/\\])\../;
            // Initially we watch nothing. We'll add the paths later.
            const watcher = chokidar.watch(MATCH_NOTHING_REGEX, { ignored: IGNORE_DOT_FILES_REGEX });
            const onFileChangedAsync = () => __awaiter(this, void 0, void 0, function* () {
                watcher.unwatch('*'); // Stop watching
                try {
                    yield this.compileAsync();
                    utils_1.logUtils.logWithTime('Found 0 errors. Watching for file changes.');
                }
                catch (err) {
                    if (err.typeName === 'CompilationError') {
                        utils_1.logUtils.logWithTime(`Found ${err.errorsCount} ${pluralize('error', err.errorsCount)}. Watching for file changes.`);
                    }
                    else {
                        utils_1.logUtils.logWithTime('Found errors. Watching for file changes.');
                    }
                }
                const pathsToWatch = this._getPathsToWatch();
                watcher.add(pathsToWatch);
            });
            yield onFileChangedAsync();
            watcher.on('change', () => {
                console.clear(); // tslint:disable-line:no-console
                utils_1.logUtils.logWithTime('File change detected. Starting incremental compilation...');
                // NOTE: We can't await it here because that's a callback.
                // Instead we stop watching inside of it and start it again when we're finished.
                onFileChangedAsync(); // tslint:disable-line no-floating-promises
            });
        });
    }
    /**
     * Gets a list of contracts to compile.
     */
    getContractNamesToCompile() {
        let contractNamesToCompile;
        if (this._specifiedContracts === exports.ALL_CONTRACTS_IDENTIFIER) {
            const allContracts = this._nameResolver.getAll();
            contractNamesToCompile = _.map(allContracts, contractSource => path.basename(contractSource.path, constants_1.constants.SOLIDITY_FILE_EXTENSION));
        }
        else {
            return this._specifiedContracts;
        }
        return contractNamesToCompile;
    }
    _getPathsToWatch() {
        const contractNames = this.getContractNamesToCompile();
        const spyResolver = new sol_resolver_1.SpyResolver(this._resolver);
        for (const contractName of contractNames) {
            const contractSource = spyResolver.resolve(contractName);
            // NOTE: We ignore the return value here. We don't want to compute the source tree hash.
            // We just want to call a SpyResolver on each contracts and it's dependencies and
            // this is a convenient way to reuse the existing code that does that.
            // We can then get all the relevant paths from the `spyResolver` below.
            compiler_1.getSourceTreeHash(spyResolver, contractSource.path);
        }
        const pathsToWatch = _.uniq(spyResolver.resolvedContractSources.map(cs => cs.absolutePath));
        return pathsToWatch;
    }
    /**
     * Compiles contracts, and, if `shouldPersist` is true, saves artifacts to artifactsDir.
     * @param fileName Name of contract with '.sol' extension.
     * @return an array of compiler outputs, where each element corresponds to a different version of solc-js.
     */
    _compileContractsAsync(contractNames, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const _opts = Object.assign({ shouldPersist: false, shouldCompileIndependently: false }, opts);
            // batch input contracts together based on the version of the compiler that they require.
            const compilationUnitsByVersion = {};
            // map contract paths to data about them for later verification and persistence
            const contractPathToData = {};
            const solcJSReleases = yield compiler_1.getSolcJSReleasesAsync(this._isOfflineMode);
            const resolvedContractSources = [];
            for (const contractName of contractNames) {
                const spyResolver = new sol_resolver_1.SpyResolver(this._resolver);
                const contractSource = spyResolver.resolve(contractName);
                const sourceTreeHashHex = compiler_1.getSourceTreeHash(spyResolver, contractSource.path).toString('hex');
                const contractData = {
                    contractName: path.basename(contractName, constants_1.constants.SOLIDITY_FILE_EXTENSION),
                    currentArtifactIfExists: yield compiler_1.getContractArtifactIfExistsAsync(this._artifactsDir, contractName),
                    sourceTreeHashHex: `0x${sourceTreeHashHex}`,
                };
                if (!this._shouldCompile(contractData)) {
                    continue;
                }
                contractPathToData[contractSource.absolutePath] = contractData;
                let solcVersion;
                if (this._solcVersionIfExists) {
                    solcVersion = this._solcVersionIfExists;
                }
                else {
                    const solidityVersion = semver.maxSatisfying(_.keys(solcJSReleases), compiler_1.parseSolidityVersionRange(contractSource.source));
                    if (solidityVersion) {
                        solcVersion = compiler_1.normalizeSolcVersion(solcJSReleases[solidityVersion]);
                    }
                }
                if (solcVersion === undefined) {
                    throw new Error(`Couldn't find any solidity version satisfying the constraint ${compiler_1.parseSolidityVersionRange(contractSource.source)}`);
                }
                // Each compilation unit is a batch of inputs for a compiler version.
                const units = (compilationUnitsByVersion[solcVersion] = compilationUnitsByVersion[solcVersion] || []);
                let unit;
                if (_opts.shouldCompileIndependently) {
                    // If compiling independently, we always create a new unit for each target contract.
                    units.push((unit = {}));
                }
                else {
                    // Otherwise, we keep everything the same unit (first unit).
                    if (units.length === 0) {
                        units.push({});
                    }
                    unit = units[0];
                }
                for (const resolvedContractSource of spyResolver.resolvedContractSources) {
                    unit[resolvedContractSource.absolutePath] = resolvedContractSource.source;
                    resolvedContractSources.push(resolvedContractSource);
                }
            }
            const importRemappings = compiler_1.getDependencyNameToPackagePath(resolvedContractSources);
            const versions = Object.keys(compilationUnitsByVersion);
            if (!this._opts.useDockerisedSolc && !this._opts.isOfflineMode && versions.length > 0) {
                yield compiler_1.preFetchCSolcJSBinariesAsync(versions);
            }
            // Concurrently compile by version and compilation unit.
            const compilationResults = yield Promise.all(versions.map((solcVersion) => __awaiter(this, void 0, void 0, function* () {
                const units = compilationUnitsByVersion[solcVersion];
                {
                    const allContracts = _.uniq(_.flatten(units.map(u => Object.keys(u))));
                    utils_1.logUtils.warn(`Compiling ${allContracts.length} contracts (${allContracts.map(p => path.basename(p))}) with Solidity ${solcVersion}...`);
                }
                const compiler = this._getSolcWrapperForVersion(solcVersion);
                return Promise.all(units.map((contracts) => __awaiter(this, void 0, void 0, function* () { return compiler.compileAsync(contracts, importRemappings); })));
            })));
            if (_opts.shouldPersist) {
                // Many contracts will appear more than once as they are imported as
                // dependencies. Rather than constantly overwriting the artifacts, we
                // will only do it if the new artifact has a smaller compilation unit.
                const artifactCache = {};
                for (let i = 0; i < versions.length; ++i) {
                    const solcVersion = versions[i];
                    const units = compilationUnitsByVersion[solcVersion];
                    for (let j = 0; j < compilationResults[i].length; ++j) {
                        const compilationResult = compilationResults[i][j];
                        const contracts = units[j];
                        const unitSize = Object.keys(contracts).length;
                        for (const contractPath of Object.keys(contracts)) {
                            const contractData = contractPathToData[contractPath];
                            if (contractData === undefined) {
                                continue;
                            }
                            const { contractName } = contractData;
                            const compiledContract = compilationResult.output.contracts[contractPath][contractName];
                            if (compiledContract === undefined) {
                                throw new Error(`Contract ${contractName} not found in ${contractPath}. Please make sure your contract has the same name as it's file name`);
                            }
                            // Only write the artifact if we haven't already written
                            // a simpler version of it.
                            if (artifactCache[contractPath] !== undefined) {
                                if (artifactCache[contractPath] <= unitSize) {
                                    continue;
                                }
                            }
                            artifactCache[contractPath] = unitSize;
                            yield this._persistCompiledContractAsync(contractPath, contractPathToData[contractPath].currentArtifactIfExists, contractPathToData[contractPath].sourceTreeHashHex, contractName, solcVersion, contracts, compilationResult.input, compilationResult.output, importRemappings);
                        }
                    }
                }
            }
            return compilationResults.map(r => r.map(ur => ur.output));
        });
    }
    _shouldCompile(contractData) {
        if (contractData.currentArtifactIfExists === undefined) {
            return true;
        }
        else {
            const currentArtifact = contractData.currentArtifactIfExists;
            const solc = this._getSolcWrapperForVersion(currentArtifact.compiler.version);
            const isUserOnLatestVersion = currentArtifact.schemaVersion === constants_1.constants.LATEST_ARTIFACT_VERSION;
            const didCompilerSettingsChange = solc.areCompilerSettingsDifferent(currentArtifact.compiler.settings);
            const didSourceChange = currentArtifact.sourceTreeHashHex !== contractData.sourceTreeHashHex;
            return !isUserOnLatestVersion || didCompilerSettingsChange || didSourceChange;
        }
    }
    _getSolcWrapperForVersion(solcVersion) {
        const normalizedVersion = compiler_1.normalizeSolcVersion(solcVersion);
        return (this._solcWrappersByVersion[normalizedVersion] ||
            (this._solcWrappersByVersion[normalizedVersion] = this._createSolcInstance(normalizedVersion)));
    }
    _createSolcInstance(solcVersion) {
        if (solcVersion.startsWith('0.4.')) {
            return new solc_wrapper_v04_1.SolcWrapperV04(solcVersion, this._opts);
        }
        if (solcVersion.startsWith('0.5.')) {
            return new solc_wrapper_v05_1.SolcWrapperV05(solcVersion, this._opts);
        }
        if (solcVersion.startsWith('0.6')) {
            return new solc_wrapper_v06_1.SolcWrapperV06(solcVersion, this._opts);
        }
        if (solcVersion.startsWith('0.7')) {
            return new solc_wrapper_v07_1.SolcWrapperV07(solcVersion, this._opts);
        }
        if (solcVersion.startsWith('0.8')) {
            return new solc_wrapper_v08_1.SolcWrapperV08(solcVersion, this._opts);
        }
        throw new Error(`Missing Solc wrapper implementation for version ${solcVersion}`);
    }
    _persistCompiledContractAsync(contractPath, currentArtifactIfExists, sourceTreeHashHex, contractName, solcVersion, sourcesByPath, compilerInput, compilerOutput, importRemappings) {
        return __awaiter(this, void 0, void 0, function* () {
            const compiledContract = compilerOutput.contracts[contractPath][contractName];
            // need to gather sourceCodes for this artifact, but compilerOutput.sources (the list of contract modules)
            // contains listings for every contract compiled during the compiler invocation that compiled the contract
            // to be persisted, which could include many that are irrelevant to the contract at hand.  So, gather up only
            // the relevant sources:
            const allSources = {};
            // tslint:disable-next-line: forin
            for (const sourceContractPath in sourcesByPath) {
                const content = sourcesByPath[sourceContractPath];
                const { id, ast } = compilerOutput.sources[sourceContractPath];
                allSources[sourceContractPath] = { id, content, ast };
            }
            const usedSources = compiler_1.getSourcesWithDependencies(contractPath, allSources, importRemappings);
            const contractVersion = {
                compilerOutput: compiledContract,
                sourceTreeHashHex,
                sources: usedSources,
                sourceCodes: _.mapValues(usedSources, ({ content }) => content),
                compiler: {
                    name: 'solc',
                    version: solcVersion,
                    settings: compilerInput.settings,
                },
            };
            let newArtifact;
            if (currentArtifactIfExists !== undefined) {
                const currentArtifact = currentArtifactIfExists;
                newArtifact = Object.assign(Object.assign({}, currentArtifact), contractVersion);
            }
            else {
                newArtifact = Object.assign(Object.assign({ schemaVersion: constants_1.constants.LATEST_ARTIFACT_VERSION, contractName }, contractVersion), { chains: {} });
            }
            const artifactString = utils_2.utils.stringifyWithFormatting(newArtifact);
            const currentArtifactPath = `${this._artifactsDir}/${contractName}.json`;
            yield fs_wrapper_1.fsWrapper.writeFileAsync(currentArtifactPath, artifactString);
            utils_1.logUtils.warn(`${contractName} artifact saved!`);
            if (this._shouldSaveStandardInput) {
                yield fs_wrapper_1.fsWrapper.writeFileAsync(`${this._artifactsDir}/${contractName}.input.json`, utils_2.utils.stringifyWithFormatting(Object.assign(Object.assign({}, compilerInput), { 
                    // Insert solcVersion into input.
                    settings: Object.assign(Object.assign({}, compilerInput.settings), { version: solcVersion }) })));
                utils_1.logUtils.warn(`${contractName} input artifact saved!`);
            }
        });
    }
}
exports.Compiler = Compiler;
// tslint:disable: max-file-line-count
//# sourceMappingURL=compiler.js.map