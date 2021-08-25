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
const fs = require("fs");
require("mocha");
const tmp = require("tmp");
const utils_1 = require("../src/utils");
tmp.setGracefulCleanup(); // remove tmp files even if there are failures
chai.use(dirtyChai);
const expect = chai.expect;
describe('makeOutputFileName()', () => {
    it('should handle Metacoin usage', () => {
        expect(utils_1.utils.makeOutputFileName('Metacoin')).to.equal('metacoin');
    });
    it('should handle special zrx_token case', () => {
        expect(utils_1.utils.makeOutputFileName('ZRXToken')).to.equal('zrx_token');
    });
    it('should handle special erc_token case', () => {
        expect(utils_1.utils.makeOutputFileName('ERC20Token')).to.equal('erc20_token');
    });
});
describe('writeOutputFile()', () => {
    let tempFilePath;
    before(() => {
        tempFilePath = tmp.fileSync({ discardDescriptor: true }).name;
    });
    it('should write content to output file', () => {
        const content = 'hello world';
        utils_1.utils.writeOutputFile(tempFilePath, content);
        expect(fs.readFileSync(tempFilePath).toString()).to.equal(content);
    });
});
describe('isOutputFileUpToDate()', () => {
    it('should throw ENOENT when there is no abi file', () => {
        expect(utils_1.utils.isOutputFileUpToDate.bind('', 'nonexistant1', ['nonexistant2'])).to.throw('ENOENT');
    });
    describe('when the abi input file exists', () => {
        let abiFile;
        before(() => {
            abiFile = tmp.fileSync({ discardDescriptor: true }).name;
        });
        describe('without an existing output file', () => {
            it('should return false', () => {
                expect(utils_1.utils.isOutputFileUpToDate('nonexistant_file', [abiFile])).to.be.false;
            });
        });
        describe('with an existing output file', () => {
            let outputFile;
            before(() => {
                outputFile = tmp.fileSync({ discardDescriptor: true }).name;
                const abiFileModTimeMs = fs.statSync(abiFile).mtimeMs;
                const outfileModTimeMs = abiFileModTimeMs + 1;
                fs.utimesSync(outputFile, outfileModTimeMs, outfileModTimeMs);
            });
            it('should return true when output file is newer than abi file', () => __awaiter(void 0, void 0, void 0, function* () {
                expect(utils_1.utils.isOutputFileUpToDate(outputFile, [abiFile])).to.be.true;
            }));
            it('should return false when output file exists but is older than abi file', () => {
                const outFileModTimeMs = fs.statSync(outputFile).mtimeMs;
                const abiFileModTimeMs = outFileModTimeMs + 1;
                fs.utimesSync(abiFile, abiFileModTimeMs, abiFileModTimeMs);
                expect(utils_1.utils.isOutputFileUpToDate(outputFile, [abiFile])).to.be.false;
            });
            it('should return false when any source file is newer than output file', () => {
                const templateFile = tmp.fileSync({ discardDescriptor: true }).name;
                const templateFileModTimeMs = fs.statSync(outputFile).mtimeMs + 1;
                const abiFileModTimeMs = fs.statSync(outputFile).mtimeMs;
                fs.utimesSync(templateFile, templateFileModTimeMs, templateFileModTimeMs);
                fs.utimesSync(abiFile, abiFileModTimeMs, abiFileModTimeMs);
                expect(utils_1.utils.isOutputFileUpToDate(outputFile, [abiFile, templateFile])).to.be.false;
            });
        });
    });
});
//# sourceMappingURL=utils_test.js.map