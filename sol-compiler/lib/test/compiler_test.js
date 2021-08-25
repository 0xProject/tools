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
const utils_1 = require("@0x/utils");
const chai = require("chai");
require("mocha");
const path_1 = require("path");
const compiler_1 = require("../src/compiler");
const fs_wrapper_1 = require("../src/utils/fs_wrapper");
const exchange_bin_1 = require("./fixtures/exchange_bin");
const v6_contract_bin_1 = require("./fixtures/v6_contract_bin");
const v7_contract_bin_1 = require("./fixtures/v7_contract_bin");
const v8_contract_bin_1 = require("./fixtures/v8_contract_bin");
const chai_setup_1 = require("./util/chai_setup");
const constants_1 = require("./util/constants");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const METADATA_SIZE = 43;
describe('#Compiler', function () {
    this.timeout(constants_1.constants.timeoutMs); // tslint:disable-line:no-invalid-this
    const artifactsDir = `${__dirname}/fixtures/artifacts`;
    const contractsDir = `${__dirname}/fixtures/contracts`;
    const compilerOpts = {
        artifactsDir,
        contractsDir,
        contracts: constants_1.constants.contracts,
    };
    it('should create a Compiler with empty opts', () => __awaiter(this, void 0, void 0, function* () {
        const _compiler = new compiler_1.Compiler(); // tslint:disable-line no-unused-variable
    }));
    it('should create an Exchange artifact with the correct unlinked binary', () => __awaiter(this, void 0, void 0, function* () {
        compilerOpts.contracts = ['Exchange'];
        const exchangeArtifactPath = `${artifactsDir}/Exchange.json`;
        if (fs_wrapper_1.fsWrapper.doesPathExistSync(exchangeArtifactPath)) {
            yield fs_wrapper_1.fsWrapper.removeFileAsync(exchangeArtifactPath);
        }
        yield new compiler_1.Compiler(compilerOpts).compileAsync();
        const opts = {
            encoding: 'utf8',
        };
        const exchangeArtifactString = yield fs_wrapper_1.fsWrapper.readFileAsync(exchangeArtifactPath, opts);
        const exchangeArtifact = JSON.parse(exchangeArtifactString);
        const unlinkedBinaryWithoutMetadata = utils_1.hexUtils.slice(exchangeArtifact.compilerOutput.evm.bytecode.object, 0, -METADATA_SIZE);
        const exchangeBinaryWithoutMetadata = utils_1.hexUtils.slice(exchange_bin_1.exchange_binary, 0, -METADATA_SIZE);
        expect(unlinkedBinaryWithoutMetadata).to.equal(exchangeBinaryWithoutMetadata);
    }));
    it('can create an Exchange artifact with independent compilation', () => __awaiter(this, void 0, void 0, function* () {
        compilerOpts.contracts = ['Exchange'];
        const exchangeArtifactPath = `${artifactsDir}/Exchange.json`;
        if (fs_wrapper_1.fsWrapper.doesPathExistSync(exchangeArtifactPath)) {
            yield fs_wrapper_1.fsWrapper.removeFileAsync(exchangeArtifactPath);
        }
        yield new compiler_1.Compiler(Object.assign(Object.assign({}, compilerOpts), { shouldCompileIndependently: true })).compileAsync();
        const opts = {
            encoding: 'utf8',
        };
        const exchangeArtifactString = yield fs_wrapper_1.fsWrapper.readFileAsync(exchangeArtifactPath, opts);
        const exchangeArtifact = JSON.parse(exchangeArtifactString);
        const unlinkedBinaryWithoutMetadata = utils_1.hexUtils.slice(exchangeArtifact.compilerOutput.evm.bytecode.object, 0, -METADATA_SIZE);
        const exchangeBinaryWithoutMetadata = utils_1.hexUtils.slice(exchange_bin_1.exchange_binary, 0, -METADATA_SIZE);
        expect(unlinkedBinaryWithoutMetadata).to.equal(exchangeBinaryWithoutMetadata);
    }));
    it("should throw when Whatever.sol doesn't contain a Whatever contract", () => __awaiter(this, void 0, void 0, function* () {
        const contract = 'BadContractName';
        const exchangeArtifactPath = `${artifactsDir}/${contract}.json`;
        if (fs_wrapper_1.fsWrapper.doesPathExistSync(exchangeArtifactPath)) {
            yield fs_wrapper_1.fsWrapper.removeFileAsync(exchangeArtifactPath);
        }
        compilerOpts.contracts = [contract];
        const compiler = new compiler_1.Compiler(compilerOpts);
        expect(compiler.compileAsync()).to.be.rejected();
    }));
    describe('after a successful compilation', () => {
        const contract = 'Exchange';
        let artifactPath;
        let artifactCreatedAtMs;
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            compilerOpts.contracts = [contract];
            artifactPath = `${artifactsDir}/${contract}.json`;
            if (fs_wrapper_1.fsWrapper.doesPathExistSync(artifactPath)) {
                yield fs_wrapper_1.fsWrapper.removeFileAsync(artifactPath);
            }
            yield new compiler_1.Compiler(compilerOpts).compileAsync();
            artifactCreatedAtMs = (yield fs_wrapper_1.fsWrapper.statAsync(artifactPath)).mtimeMs;
        }));
        it('recompilation should update artifact when source has changed', () => __awaiter(this, void 0, void 0, function* () {
            // append some meaningless data to the contract, so that its hash
            // will change, so that the compiler will decide to recompile it.
            yield fs_wrapper_1.fsWrapper.appendFileAsync(path_1.join(contractsDir, `${contract}.sol`), ' ');
            yield new compiler_1.Compiler(compilerOpts).compileAsync();
            const artifactModifiedAtMs = (yield fs_wrapper_1.fsWrapper.statAsync(artifactPath)).mtimeMs;
            expect(artifactModifiedAtMs).to.be.greaterThan(artifactCreatedAtMs);
        }));
        it("recompilation should NOT update artifact when source hasn't changed", () => __awaiter(this, void 0, void 0, function* () {
            yield new compiler_1.Compiler(compilerOpts).compileAsync();
            const artifactModifiedAtMs = (yield fs_wrapper_1.fsWrapper.statAsync(artifactPath)).mtimeMs;
            expect(artifactModifiedAtMs).to.equal(artifactCreatedAtMs);
        }));
    });
    it('should only compile what was requested', () => __awaiter(this, void 0, void 0, function* () {
        // remove all artifacts
        for (const artifact of yield fs_wrapper_1.fsWrapper.readdirAsync(artifactsDir)) {
            yield fs_wrapper_1.fsWrapper.removeFileAsync(path_1.join(artifactsDir, artifact));
        }
        // compile EmptyContract
        compilerOpts.contracts = ['EmptyContract'];
        yield new compiler_1.Compiler(compilerOpts).compileAsync();
        // make sure the artifacts dir only contains EmptyContract.json
        for (const artifact of yield fs_wrapper_1.fsWrapper.readdirAsync(artifactsDir)) {
            expect(artifact).to.equal('EmptyContract.json');
        }
    }));
    it('should compile a V0.6 contract', () => __awaiter(this, void 0, void 0, function* () {
        compilerOpts.contracts = ['V6Contract'];
        const artifactPath = `${artifactsDir}/V6Contract.json`;
        if (fs_wrapper_1.fsWrapper.doesPathExistSync(artifactPath)) {
            yield fs_wrapper_1.fsWrapper.removeFileAsync(artifactPath);
        }
        yield new compiler_1.Compiler(compilerOpts).compileAsync();
        const opts = {
            encoding: 'utf8',
        };
        const exchangeArtifactString = yield fs_wrapper_1.fsWrapper.readFileAsync(artifactPath, opts);
        const exchangeArtifact = JSON.parse(exchangeArtifactString);
        const actualBinaryWithoutMetadata = utils_1.hexUtils.slice(exchangeArtifact.compilerOutput.evm.bytecode.object, 0, -METADATA_SIZE);
        const expectedBinaryWithoutMetadata = utils_1.hexUtils.slice(v6_contract_bin_1.v6_contract_binary, 0, -METADATA_SIZE);
        expect(actualBinaryWithoutMetadata).to.eq(expectedBinaryWithoutMetadata);
    }));
    it('should compile a V0.7 contract', () => __awaiter(this, void 0, void 0, function* () {
        compilerOpts.contracts = ['V7Contract'];
        const artifactPath = `${artifactsDir}/V7Contract.json`;
        if (fs_wrapper_1.fsWrapper.doesPathExistSync(artifactPath)) {
            yield fs_wrapper_1.fsWrapper.removeFileAsync(artifactPath);
        }
        yield new compiler_1.Compiler(compilerOpts).compileAsync();
        const opts = {
            encoding: 'utf8',
        };
        const exchangeArtifactString = yield fs_wrapper_1.fsWrapper.readFileAsync(artifactPath, opts);
        const exchangeArtifact = JSON.parse(exchangeArtifactString);
        const actualBinaryWithoutMetadata = utils_1.hexUtils.slice(exchangeArtifact.compilerOutput.evm.bytecode.object, 0, -METADATA_SIZE);
        const expectedBinaryWithoutMetadata = utils_1.hexUtils.slice(v7_contract_bin_1.v7_contract_binary, 0, -METADATA_SIZE);
        expect(actualBinaryWithoutMetadata).to.eq(expectedBinaryWithoutMetadata);
    }));
    it('should compile a V0.8 contract', () => __awaiter(this, void 0, void 0, function* () {
        compilerOpts.contracts = ['V8Contract'];
        const artifactPath = `${artifactsDir}/V8Contract.json`;
        if (fs_wrapper_1.fsWrapper.doesPathExistSync(artifactPath)) {
            yield fs_wrapper_1.fsWrapper.removeFileAsync(artifactPath);
        }
        yield new compiler_1.Compiler(compilerOpts).compileAsync();
        const opts = {
            encoding: 'utf8',
        };
        const exchangeArtifactString = yield fs_wrapper_1.fsWrapper.readFileAsync(artifactPath, opts);
        const exchangeArtifact = JSON.parse(exchangeArtifactString);
        const actualBinaryWithoutMetadata = utils_1.hexUtils.slice(exchangeArtifact.compilerOutput.evm.bytecode.object, 0, -METADATA_SIZE);
        const expectedBinaryWithoutMetadata = utils_1.hexUtils.slice(v8_contract_bin_1.v8_contract_binary, 0, -METADATA_SIZE);
        expect(actualBinaryWithoutMetadata).to.eq(expectedBinaryWithoutMetadata);
    }));
});
//# sourceMappingURL=compiler_test.js.map