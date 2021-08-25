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
const _ = require("lodash");
require("mocha");
const path = require("path");
const sol_compiler_artifact_adapter_1 = require("../src/artifact_adapters/sol_compiler_artifact_adapter");
const expect = chai.expect;
describe('SolCompilerArtifactAdapter', () => {
    describe('#collectContractsData', () => {
        it('correctly collects contracts data', () => __awaiter(void 0, void 0, void 0, function* () {
            const artifactsPath = path.resolve(__dirname, 'fixtures/artifacts');
            const sourcesPath = path.resolve(__dirname, 'fixtures/contracts');
            const zeroExArtifactsAdapter = new sol_compiler_artifact_adapter_1.SolCompilerArtifactAdapter(artifactsPath, sourcesPath);
            const contractsData = yield zeroExArtifactsAdapter.collectContractsDataAsync();
            _.forEach(contractsData, contractData => {
                expect(contractData).to.have.keys([
                    'name',
                    'sourceCodes',
                    'sources',
                    'sourceMap',
                    'sourceMapRuntime',
                    'bytecode',
                    'runtimeBytecode',
                ]);
            });
        }));
    });
});
//# sourceMappingURL=sol_compiler_artifact_adapter_test.js.map