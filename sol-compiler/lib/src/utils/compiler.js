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
exports.getJSFullSolcVersionAsync = exports.getDockerFullSolcVersionAsync = exports.normalizeSolcVersion = exports.getSolidityVersionFromSolcVersion = exports.getDependencyNameToPackagePath = exports.addHexPrefixToContractBytecode = exports.getSolcJSVersionFromPath = exports.getSolcJSFromPath = exports.getSolcJSAsync = exports.preFetchCSolcJSBinariesAsync = exports.getSourcesWithDependencies = exports.getSourceTreeHash = exports.printCompilationErrorsAndWarnings = exports.makeContractPathsRelative = exports.compileDockerAsync = exports.compileSolcJSAsync = exports.getSolcJSReleasesAsync = exports.parseDependencies = exports.getNormalizedErrMsg = exports.parseSolidityVersionRange = exports.createDirIfDoesNotExistAsync = exports.getContractArtifactIfExistsAsync = void 0;
const utils_1 = require("@0x/utils");
const chalk_1 = require("chalk");
const child_process_1 = require("child_process");
const ethUtil = require("ethereumjs-util");
const _ = require("lodash");
const path = require("path");
const requireFromString = require("require-from-string");
const solc = require("solc");
const stripComments = require("strip-comments");
const util_1 = require("util");
const constants_1 = require("./constants");
const fs_wrapper_1 = require("./fs_wrapper");
const types_1 = require("./types");
/**
 * Gets contract data or returns if an artifact does not exist.
 * @param artifactsDir Path to the artifacts directory.
 * @param contractName Name of contract.
 * @return Contract data or undefined.
 */
function getContractArtifactIfExistsAsync(artifactsDir, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        let contractArtifact;
        const currentArtifactPath = `${artifactsDir}/${path.basename(contractName, constants_1.constants.SOLIDITY_FILE_EXTENSION)}.json`;
        try {
            const opts = {
                encoding: 'utf8',
            };
            const contractArtifactString = yield fs_wrapper_1.fsWrapper.readFileAsync(currentArtifactPath, opts);
            contractArtifact = JSON.parse(contractArtifactString);
            return contractArtifact;
        }
        catch (err) {
            return undefined;
        }
    });
}
exports.getContractArtifactIfExistsAsync = getContractArtifactIfExistsAsync;
/**
 * Creates a directory if it does not already exist.
 * @param artifactsDir Path to the directory.
 */
function createDirIfDoesNotExistAsync(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_wrapper_1.fsWrapper.doesPathExistSync(dirPath)) {
            utils_1.logUtils.warn(`Creating directory at ${dirPath}...`);
            yield fs_wrapper_1.fsWrapper.mkdirpAsync(dirPath);
        }
    });
}
exports.createDirIfDoesNotExistAsync = createDirIfDoesNotExistAsync;
/**
 * Searches Solidity source code for compiler version range.
 * @param  source Source code of contract.
 * @return Solc compiler version range.
 */
function parseSolidityVersionRange(source) {
    const SOLIDITY_VERSION_RANGE_REGEX = /pragma\s+solidity\s+(.*);/;
    const solcVersionRangeMatch = source.match(SOLIDITY_VERSION_RANGE_REGEX);
    if (solcVersionRangeMatch === null) {
        throw new Error('Could not find Solidity version range in source');
    }
    const solcVersionRange = solcVersionRangeMatch[1];
    return solcVersionRange;
}
exports.parseSolidityVersionRange = parseSolidityVersionRange;
/**
 * Normalizes the path found in the error message. If it cannot be normalized
 * the original error message is returned.
 * Example: converts 'base/Token.sol:6:46: Warning: Unused local variable'
 *          to 'Token.sol:6:46: Warning: Unused local variable'
 * This is used to prevent logging the same error multiple times.
 * @param  errMsg An error message from the compiled output.
 * @return The error message with directories truncated from the contract path.
 */
function getNormalizedErrMsg(errMsg) {
    const SOLIDITY_FILE_EXTENSION_REGEX = /(.*\.sol):/;
    const errPathMatch = errMsg.match(SOLIDITY_FILE_EXTENSION_REGEX);
    if (errPathMatch === null) {
        // This can occur if solidity outputs a general warning, e.g
        // Warning: This is a pre-release compiler version, please do not use it in production.
        return errMsg;
    }
    const errPath = errPathMatch[0];
    const baseContract = path.basename(errPath);
    const normalizedErrMsg = errMsg.replace(errPath, baseContract);
    return normalizedErrMsg;
}
exports.getNormalizedErrMsg = getNormalizedErrMsg;
/**
 * Parses the contract source code and extracts the dendencies
 * @param  source Contract source code
 * @return List of dependendencies
 */
function parseDependencies(contractSource) {
    // TODO: Use a proper parser
    const source = contractSource.source;
    const sourceWithoutComments = stripComments(source);
    const IMPORT_REGEX = /(import\s)/;
    const DEPENDENCY_PATH_REGEX = /"([^"]+)"/; // Source: https://github.com/BlockChainCompany/soljitsu/blob/master/lib/shared.js
    const dependencies = [];
    const lines = sourceWithoutComments.split('\n');
    _.forEach(lines, line => {
        if (line.match(IMPORT_REGEX) !== null) {
            const dependencyMatch = line.match(DEPENDENCY_PATH_REGEX);
            if (dependencyMatch !== null) {
                let dependencyPath = dependencyMatch[1];
                if (dependencyPath.startsWith('.')) {
                    dependencyPath = path.join(path.dirname(contractSource.path), dependencyPath);
                }
                dependencies.push(dependencyPath);
            }
        }
    });
    return dependencies;
}
exports.parseDependencies = parseDependencies;
let solcJSReleasesCache;
/**
 * Fetches the list of available solidity compilers
 * @param isOfflineMode Offline mode flag
 */
function getSolcJSReleasesAsync(isOfflineMode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isOfflineMode) {
            return constants_1.constants.SOLC_BIN_PATHS;
        }
        if (solcJSReleasesCache === undefined) {
            // See if we cached it on-disk first.
            try {
                const st = yield fs_wrapper_1.fsWrapper.statAsync(constants_1.constants.SOLCJS_RELEASES_PATH);
                if (Date.now() - st.ctime.getTime() >= constants_1.constants.SOLCJS_RELEASES_CACHE_EXPIRY) {
                    // Remove the cached file and ignore it if it's too old.
                    yield fs_wrapper_1.fsWrapper.removeFileAsync(constants_1.constants.SOLCJS_RELEASES_PATH);
                }
                else {
                    // Use the cached file otherwise.
                    return (solcJSReleasesCache = JSON.parse((yield fs_wrapper_1.fsWrapper.readFileAsync(constants_1.constants.SOLCJS_RELEASES_PATH))));
                }
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
            }
            // Fetch from the WWW.
            const versionList = yield fetch('https://solc-bin.ethereum.org/bin/list.json');
            const versionListJSON = yield versionList.json();
            solcJSReleasesCache = versionListJSON.releases;
            // Cache the result on disk.
            yield fs_wrapper_1.fsWrapper.writeFileAsync(constants_1.constants.SOLCJS_RELEASES_PATH, JSON.stringify(solcJSReleasesCache, null, '\t'));
        }
        return solcJSReleasesCache;
    });
}
exports.getSolcJSReleasesAsync = getSolcJSReleasesAsync;
/**
 * Compiles the contracts and prints errors/warnings
 * @param solcInstance Instance of a solc compiler
 * @param standardInput Solidity standard JSON input
 * @param isOfflineMode Offline mode flag
 */
function compileSolcJSAsync(solcInstance, standardInput) {
    return __awaiter(this, void 0, void 0, function* () {
        const standardInputStr = JSON.stringify(standardInput);
        const standardOutputStr = solcInstance.compileStandardWrapper(standardInputStr);
        const compiled = JSON.parse(standardOutputStr);
        return compiled;
    });
}
exports.compileSolcJSAsync = compileSolcJSAsync;
/**
 * Compiles the contracts and prints errors/warnings
 * @param solidityVersion Solidity version
 * @param standardInput Solidity standard JSON input
 */
function compileDockerAsync(solidityVersion, standardInput) {
    return __awaiter(this, void 0, void 0, function* () {
        const standardInputStr = JSON.stringify(standardInput, null, 2);
        // prettier-ignore
        const dockerArgs = [
            'run',
            '-i',
            '-a', 'stdin',
            '-a', 'stdout',
            '-a', 'stderr',
            `ethereum/solc:${solidityVersion}`,
            'solc', '--standard-json',
        ];
        return new Promise((accept, reject) => {
            const p = child_process_1.spawn('docker', dockerArgs, { shell: true, stdio: ['pipe', 'pipe', 'inherit'] });
            p.stdin.write(standardInputStr);
            p.stdin.end();
            let fullOutput = '';
            p.stdout.on('data', (chunk) => {
                fullOutput += chunk;
            });
            p.on('close', code => {
                if (code !== 0) {
                    reject('Compilation failed');
                }
                accept(JSON.parse(fullOutput));
            });
        });
    });
}
exports.compileDockerAsync = compileDockerAsync;
/**
 * Example "relative" paths:
 * /user/leo/0x-monorepo/contracts/extensions/contracts/extension.sol -> extension.sol
 * /user/leo/0x-monorepo/node_modules/@0x/contracts-protocol/contracts/exchange.sol -> @0x/contracts-protocol/contracts/exchange.sol
 */
function makeContractPathRelative(absolutePath, contractsDir, dependencyNameToPath) {
    let contractPath = absolutePath.replace(`${contractsDir}/`, '');
    _.map(dependencyNameToPath, (packagePath, dependencyName) => {
        contractPath = contractPath.replace(packagePath, dependencyName);
    });
    return contractPath;
}
/**
 * Makes the path relative removing all system-dependent data. Converts absolute paths to a format suitable for artifacts.
 * @param absolutePathToSmth Absolute path to contract or source
 * @param contractsDir Current package contracts directory location
 * @param dependencyNameToPath Mapping of dependency name to package path
 */
function makeContractPathsRelative(absolutePathToSmth, contractsDir, dependencyNameToPath) {
    return _.mapKeys(absolutePathToSmth, (_val, absoluteContractPath) => makeContractPathRelative(absoluteContractPath, contractsDir, dependencyNameToPath));
}
exports.makeContractPathsRelative = makeContractPathsRelative;
/**
 * Separates errors from warnings, formats the messages and prints them. Throws if there is any compilation error (not warning).
 * @param solcErrors The errors field of standard JSON output that contains errors and warnings.
 */
function printCompilationErrorsAndWarnings(solcErrors) {
    const SOLIDITY_WARNING = 'warning';
    const errors = _.filter(solcErrors, entry => entry.severity !== SOLIDITY_WARNING);
    const warnings = _.filter(solcErrors, entry => entry.severity === SOLIDITY_WARNING);
    if (!_.isEmpty(errors)) {
        errors.forEach(error => {
            const normalizedErrMsg = getNormalizedErrMsg(error.formattedMessage || error.message);
            utils_1.logUtils.log(chalk_1.default.red('error'), normalizedErrMsg);
        });
        throw new types_1.CompilationError(errors.length);
    }
    else {
        warnings.forEach(warning => {
            const normalizedWarningMsg = getNormalizedErrMsg(warning.formattedMessage || warning.message);
            utils_1.logUtils.log(chalk_1.default.yellow('warning'), normalizedWarningMsg);
        });
    }
}
exports.printCompilationErrorsAndWarnings = printCompilationErrorsAndWarnings;
/**
 * Gets the source tree hash for a file and its dependencies.
 * @param fileName Name of contract file.
 */
function getSourceTreeHash(resolver, importPath) {
    const contractSource = resolver.resolve(importPath);
    const dependencies = parseDependencies(contractSource);
    const sourceHash = ethUtil.keccak256(Buffer.from(contractSource.source));
    if (dependencies.length === 0) {
        return sourceHash;
    }
    else {
        const dependencySourceTreeHashes = _.map(dependencies, (dependency) => {
            try {
                return getSourceTreeHash(resolver, dependency);
            }
            catch (e) {
                if (/Error when trying to resolve dependencies for/.test(e.message)) {
                    throw e;
                }
                else {
                    throw Error(`Error when trying to resolve dependencies for ${importPath}: ${e.message}`);
                }
            }
        });
        const sourceTreeHashesBuffer = Buffer.concat([sourceHash, ...dependencySourceTreeHashes]);
        const sourceTreeHash = ethUtil.keccak256(sourceTreeHashesBuffer);
        return sourceTreeHash;
    }
}
exports.getSourceTreeHash = getSourceTreeHash;
/**
 * Recursively parses imports from sources starting from `contractPath`.
 * @return Sources required by imports.
 */
function getSourcesWithDependencies(contractPath, sourcesByAbsolutePath, importRemappings) {
    const compiledImports = { [`./${path.basename(contractPath)}`]: sourcesByAbsolutePath[contractPath] };
    recursivelyGatherDependencySources(contractPath, path.dirname(contractPath), sourcesByAbsolutePath, importRemappings, compiledImports);
    return compiledImports;
}
exports.getSourcesWithDependencies = getSourcesWithDependencies;
function recursivelyGatherDependencySources(contractPath, rootDir, sourcesByAbsolutePath, importRemappings, compiledImports, visitedAbsolutePaths = {}, importRootDir) {
    if (visitedAbsolutePaths[contractPath]) {
        return;
    }
    else {
        visitedAbsolutePaths[contractPath] = true;
    }
    const contractSource = sourcesByAbsolutePath[contractPath].content;
    const contractSourceWithoutComments = stripComments(contractSource);
    const importStatementMatches = contractSourceWithoutComments.match(/\nimport[^;]*;/g);
    if (importStatementMatches === null) {
        return;
    }
    const lastPathSeparatorPos = contractPath.lastIndexOf('/');
    const contractFolder = lastPathSeparatorPos === -1 ? '' : contractPath.slice(0, lastPathSeparatorPos + 1);
    for (const importStatementMatch of importStatementMatches) {
        const importPathMatches = importStatementMatch.match(/\"([^\"]*)\"/);
        if (importPathMatches === null || importPathMatches.length === 0) {
            continue;
        }
        let importPath = importPathMatches[1];
        let absPath = importPath;
        let _importRootDir = importRootDir;
        if (importPath.startsWith('.')) {
            absPath = path.join(contractFolder, importPath);
            if (_importRootDir) {
                // If there's an `_importRootDir`, we're in a package, so express
                // the import path as within the package.
                importPath = path.join(_importRootDir, importPath);
            }
            else {
                // Express relative imports paths as paths from the root directory.
                importPath = path.relative(rootDir, absPath);
                if (!importPath.startsWith('.')) {
                    importPath = `./${importPath}`;
                }
            }
        }
        else {
            for (const [prefix, replacement] of Object.entries(importRemappings)) {
                if (importPath.startsWith(prefix)) {
                    absPath = `${replacement}${importPath.substr(prefix.length)}`;
                    _importRootDir = path.dirname(importPath);
                    break;
                }
            }
        }
        compiledImports[importPath] = sourcesByAbsolutePath[absPath];
        recursivelyGatherDependencySources(absPath, rootDir, sourcesByAbsolutePath, importRemappings, compiledImports, visitedAbsolutePaths, _importRootDir);
    }
}
const solcJSCache = {};
let solcJSReleases;
/**
 * Calls `getSolcJSAsync()` for every solc version passed in.
 * @param versions Arrays of solc versions.
 */
function preFetchCSolcJSBinariesAsync(solcVersions) {
    return __awaiter(this, void 0, void 0, function* () {
        const compilerVersions = solcVersions.map(solcVersion => getSolidityVersionFromSolcVersion(solcVersion));
        utils_1.logUtils.log(`Pre-fetching solidity versions: ${compilerVersions.join(', ')}...`);
        yield Promise.all(compilerVersions.map((v) => __awaiter(this, void 0, void 0, function* () { return getSolcJSAsync(v, false); })));
    });
}
exports.preFetchCSolcJSBinariesAsync = preFetchCSolcJSBinariesAsync;
/**
 * Gets the solidity compiler instance. If the compiler is already cached - gets it from FS,
 * otherwise - fetches it and caches it.
 * @param solidityVersion The solidity version. e.g. 0.5.0
 * @param isOfflineMode Offline mode flag
 */
function getSolcJSAsync(solidityVersion, isOfflineMode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!solcJSReleases) {
            solcJSReleases = yield getSolcJSReleasesAsync(isOfflineMode);
        }
        const fullSolcVersion = solcJSReleases[solidityVersion];
        if (fullSolcVersion === undefined) {
            throw new Error(`${solidityVersion} is not a known compiler version`);
        }
        if (solcJSCache[fullSolcVersion]) {
            return solcJSCache[fullSolcVersion];
        }
        const compilerBinFilename = path.join(constants_1.constants.SOLC_BIN_DIR, fullSolcVersion);
        let solcjs;
        if (yield fs_wrapper_1.fsWrapper.doesFileExistAsync(compilerBinFilename)) {
            solcjs = (yield fs_wrapper_1.fsWrapper.readFileAsync(compilerBinFilename)).toString();
        }
        else {
            utils_1.logUtils.warn(`Downloading ${fullSolcVersion}...`);
            const url = `${constants_1.constants.BASE_COMPILER_URL}${fullSolcVersion}`;
            const response = yield utils_1.fetchAsync(url);
            const SUCCESS_STATUS = 200;
            if (response.status !== SUCCESS_STATUS) {
                throw new Error(`Failed to load ${fullSolcVersion}`);
            }
            solcjs = yield response.text();
            yield fs_wrapper_1.fsWrapper.writeFileAsync(compilerBinFilename, solcjs);
        }
        if (solcjs.length === 0) {
            throw new Error('No compiler available');
        }
        const solcInstance = solc.setupMethods(requireFromString(solcjs, compilerBinFilename));
        return (solcJSCache[fullSolcVersion] = solcInstance);
    });
}
exports.getSolcJSAsync = getSolcJSAsync;
/**
 * Gets the solidity compiler instance from a module path.
 * @param path The path to the solc module.
 */
function getSolcJSFromPath(modulePath) {
    return require(modulePath);
}
exports.getSolcJSFromPath = getSolcJSFromPath;
/**
 * Gets the solidity compiler version from a module path.
 * @param path The path to the solc module.
 */
function getSolcJSVersionFromPath(modulePath) {
    return normalizeSolcVersion(require(modulePath).version());
}
exports.getSolcJSVersionFromPath = getSolcJSVersionFromPath;
/**
 * Solidity compiler emits the bytecode without a 0x prefix for a hex. This function fixes it if bytecode is present.
 * @param compiledContract The standard JSON output section for a contract. Geth modified in place.
 */
function addHexPrefixToContractBytecode(compiledContract) {
    if (compiledContract.evm !== undefined) {
        if (compiledContract.evm.bytecode !== undefined && compiledContract.evm.bytecode.object !== undefined) {
            compiledContract.evm.bytecode.object = ethUtil.addHexPrefix(compiledContract.evm.bytecode.object);
        }
        if (compiledContract.evm.deployedBytecode !== undefined &&
            compiledContract.evm.deployedBytecode.object !== undefined) {
            compiledContract.evm.deployedBytecode.object = ethUtil.addHexPrefix(compiledContract.evm.deployedBytecode.object);
        }
    }
}
exports.addHexPrefixToContractBytecode = addHexPrefixToContractBytecode;
/**
 * Takes the list of resolved contract sources from `SpyResolver` and produces a mapping from dependency name
 * to package path used in `remappings` later, as well as in generating the "relative" source paths saved to the artifact files.
 * @param contractSources The list of resolved contract sources
 */
function getDependencyNameToPackagePath(contractSources) {
    const allTouchedFiles = contractSources.map(contractSource => `${contractSource.absolutePath}`);
    const NODE_MODULES = 'node_modules';
    const allTouchedDependencies = _.filter(allTouchedFiles, filePath => filePath.includes(NODE_MODULES));
    const dependencyNameToPath = {};
    _.map(allTouchedDependencies, dependencyFilePath => {
        const lastNodeModulesStart = dependencyFilePath.lastIndexOf(NODE_MODULES);
        const lastNodeModulesEnd = lastNodeModulesStart + NODE_MODULES.length;
        const importPath = dependencyFilePath.substr(lastNodeModulesEnd + 1);
        let packageName;
        let packageScopeIfExists;
        let dependencyName;
        if (_.startsWith(importPath, '@')) {
            [packageScopeIfExists, packageName] = importPath.split('/');
            dependencyName = `${packageScopeIfExists}/${packageName}`;
        }
        else {
            [packageName] = importPath.split('/');
            dependencyName = `${packageName}`;
        }
        const dependencyPackagePath = path.join(dependencyFilePath.substr(0, lastNodeModulesEnd), dependencyName);
        dependencyNameToPath[dependencyName] = dependencyPackagePath;
    });
    return dependencyNameToPath;
}
exports.getDependencyNameToPackagePath = getDependencyNameToPackagePath;
/**
 * Extract the solidity version (e.g., '0.5.9') from a solc version (e.g., `0.5.9+commit.34d3134f`).
 */
function getSolidityVersionFromSolcVersion(solcVersion) {
    const m = /(\d+\.\d+\.\d+)\+commit\.[a-fA-F0-9]{8}/.exec(solcVersion);
    if (!m) {
        throw new Error(`Unable to parse solc version string "${solcVersion}"`);
    }
    return m[1];
}
exports.getSolidityVersionFromSolcVersion = getSolidityVersionFromSolcVersion;
/**
 * Strips any extra characters before and after the version + commit hash of a solc version string.
 */
function normalizeSolcVersion(fullSolcVersion) {
    const m = /\d+\.\d+\.\d+\+commit\.[a-fA-F0-9]{8}/.exec(fullSolcVersion);
    if (!m) {
        throw new Error(`Unable to parse solc version string "${fullSolcVersion}"`);
    }
    return m[0];
}
exports.normalizeSolcVersion = normalizeSolcVersion;
/**
 * Gets the full version string of a dockerized solc.
 */
function getDockerFullSolcVersionAsync(solidityVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const dockerCommand = `docker run ethereum/solc:${solidityVersion} --version`;
        const versionCommandOutput = (yield util_1.promisify(child_process_1.exec)(dockerCommand)).stdout.toString();
        const versionCommandOutputParts = versionCommandOutput.split(' ');
        return normalizeSolcVersion(versionCommandOutputParts[versionCommandOutputParts.length - 1].trim());
    });
}
exports.getDockerFullSolcVersionAsync = getDockerFullSolcVersionAsync;
/**
 * Gets the full version string of a JS module solc.
 */
function getJSFullSolcVersionAsync(solidityVersion, isOfflineMode = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return normalizeSolcVersion((yield getSolcJSAsync(solidityVersion, isOfflineMode)).version());
    });
}
exports.getJSFullSolcVersionAsync = getJSFullSolcVersionAsync;
// tslint:disable-next-line: max-file-line-count
//# sourceMappingURL=compiler.js.map