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
const chai = require("chai");
const dirtyChai = require("dirty-chai");
const _ = require("lodash");
require("mocha");
const compiler_1 = require("../src/utils/compiler");
const fs_wrapper_1 = require("../src/utils/fs_wrapper");
chai.use(dirtyChai);
const expect = chai.expect;
describe('Compiler utils', () => {
    describe('#getNormalizedErrorMessage', () => {
        it('normalizes the error message', () => {
            const errMsg = 'base/Token.sol:6:46: Warning: Unused local variable';
            const normalizedErrMsg = compiler_1.getNormalizedErrMsg(errMsg);
            expect(normalizedErrMsg).to.be.equal('Token.sol:6:46: Warning: Unused local variable');
        });
    });
    describe('#createDirIfDoesNotExistAsync', () => {
        it('creates artifacts dir', () => __awaiter(void 0, void 0, void 0, function* () {
            const artifactsDir = `${__dirname}/artifacts`;
            expect(fs_wrapper_1.fsWrapper.doesPathExistSync(artifactsDir)).to.be.false;
            yield compiler_1.createDirIfDoesNotExistAsync(artifactsDir);
            expect(fs_wrapper_1.fsWrapper.doesPathExistSync(artifactsDir)).to.be.true;
            fs_wrapper_1.fsWrapper.rmdirSync(artifactsDir);
            expect(fs_wrapper_1.fsWrapper.doesPathExistSync(artifactsDir)).to.be.false;
        }));
    });
    describe('#parseSolidityVersionRange', () => {
        it('correctly parses the version range', () => {
            expect(compiler_1.parseSolidityVersionRange('pragma solidity ^0.0.1;')).to.be.equal('^0.0.1');
            expect(compiler_1.parseSolidityVersionRange('\npragma solidity 0.0.1;')).to.be.equal('0.0.1');
            expect(compiler_1.parseSolidityVersionRange('pragma solidity <=1.0.1;')).to.be.equal('<=1.0.1');
            expect(compiler_1.parseSolidityVersionRange('pragma solidity   ~1.0.1;')).to.be.equal('~1.0.1');
        });
        // TODO: For now that doesn't work. This will work after we switch to a grammar-based parser
        it.skip('correctly parses the version range with comments', () => {
            expect(compiler_1.parseSolidityVersionRange('// pragma solidity ~1.0.1;\npragma solidity ~1.0.2;')).to.be.equal('~1.0.2');
        });
    });
    describe('#parseDependencies', () => {
        it('correctly parses Exchange dependencies', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = `${__dirname}/fixtures/contracts/Exchange.sol`;
            const source = yield fs_wrapper_1.fsWrapper.readFileAsync(path, {
                encoding: 'utf8',
            });
            const dependencies = compiler_1.parseDependencies({ source, path, absolutePath: path });
            const expectedDependencies = [
                'zeppelin-solidity/contracts/token/ERC20/ERC20.sol',
                'sol-compiler/lib/test/fixtures/contracts/TokenTransferProxy.sol',
                'sol-compiler/lib/test/fixtures/contracts/base/SafeMath.sol',
            ];
            _.each(expectedDependencies, expectedDepdency => {
                const foundDependency = _.find(dependencies, dependency => _.endsWith(dependency, expectedDepdency));
                expect(foundDependency, `${expectedDepdency} not found`).to.not.be.undefined;
            });
        }));
        it('correctly parses TokenTransferProxy dependencies', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = `${__dirname}/fixtures/contracts/TokenTransferProxy.sol`;
            const source = yield fs_wrapper_1.fsWrapper.readFileAsync(path, {
                encoding: 'utf8',
            });
            expect(compiler_1.parseDependencies({ source, path, absolutePath: path })).to.be.deep.equal([
                'zeppelin-solidity/contracts/ownership/Ownable.sol',
                'zeppelin-solidity/contracts/token/ERC20/ERC20.sol',
            ]);
        }));
        // TODO: For now that doesn't work. This will work after we switch to a grammar-based parser
        it.skip('correctly parses commented out dependencies', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = '';
            const source = `// import "./TokenTransferProxy.sol";`;
            expect(compiler_1.parseDependencies({ path, source, absolutePath: path })).to.be.deep.equal([]);
        }));
    });
});
//# sourceMappingURL=compiler_utils_test.js.map