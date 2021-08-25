"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NameResolver = void 0;
const fs = require("fs");
const path = require("path");
const enumerable_resolver_1 = require("./enumerable_resolver");
const SOLIDITY_FILE_EXTENSION = '.sol';
class NameResolver extends enumerable_resolver_1.EnumerableResolver {
    constructor(contractsDir) {
        super();
        this._contractsDir = contractsDir;
    }
    resolveIfExists(lookupContractName) {
        const lookupContractNameNormalized = path.basename(lookupContractName, SOLIDITY_FILE_EXTENSION);
        let contractSource;
        const onFile = (filePath) => {
            const contractName = path.basename(filePath, SOLIDITY_FILE_EXTENSION);
            if (contractName === lookupContractNameNormalized) {
                const absoluteContractPath = path.join(this._contractsDir, filePath);
                const source = fs.readFileSync(absoluteContractPath).toString('ascii');
                contractSource = { source, path: filePath, absolutePath: absoluteContractPath };
                return true;
            }
            return undefined;
        };
        this._traverseContractsDir(this._contractsDir, onFile);
        return contractSource;
    }
    getAll() {
        const contractSources = [];
        const onFile = (filePath) => {
            const absoluteContractPath = path.join(this._contractsDir, filePath);
            const source = fs.readFileSync(absoluteContractPath).toString('ascii');
            const contractSource = { source, path: filePath, absolutePath: absoluteContractPath };
            contractSources.push(contractSource);
        };
        this._traverseContractsDir(this._contractsDir, onFile);
        return contractSources;
    }
    // tslint:disable-next-line:prefer-function-over-method
    _traverseContractsDir(dirPath, onFile) {
        let dirContents = [];
        try {
            dirContents = fs.readdirSync(dirPath);
        }
        catch (err) {
            throw new Error(`No directory found at ${dirPath}`);
        }
        for (const fileName of dirContents) {
            const absoluteEntryPath = path.join(dirPath, fileName);
            const isDirectory = fs.lstatSync(absoluteEntryPath).isDirectory();
            const entryPath = path.relative(this._contractsDir, absoluteEntryPath);
            let isComplete;
            if (isDirectory) {
                isComplete = this._traverseContractsDir(absoluteEntryPath, onFile);
            }
            else if (fileName.endsWith(SOLIDITY_FILE_EXTENSION)) {
                isComplete = onFile(entryPath);
            }
            if (isComplete) {
                return isComplete;
            }
        }
        return false;
    }
}
exports.NameResolver = NameResolver;
//# sourceMappingURL=name_resolver.js.map