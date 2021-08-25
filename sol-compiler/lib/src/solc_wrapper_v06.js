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
exports.SolcWrapperV06 = void 0;
const compiler_1 = require("./utils/compiler");
const solc_wrapper_v05_1 = require("./solc_wrapper_v05");
class SolcWrapperV06 extends solc_wrapper_v05_1.SolcWrapperV05 {
    constructor(solcVersion, opts) {
        super(solcVersion, opts);
    }
    _compileInputAsync(input) {
        const _super = Object.create(null, {
            _compileInputAsync: { get: () => super._compileInputAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this._opts.useDockerisedSolc) {
                return _super._compileInputAsync.call(this, input);
            }
            // Shim the old `compileStandardWrapper` function.
            const solcInstance = (yield compiler_1.getSolcJSAsync(this.solidityVersion, !!this._opts.isOfflineMode));
            solcInstance.compileStandardWrapper = solcInstance.compile;
            return compiler_1.compileSolcJSAsync(solcInstance, input);
        });
    }
    _normalizeOutput(output) {
        const _output = super._normalizeOutput(output);
        // Filter out 'receive' ABI item types until ethers supports it.
        for (const contracts of Object.values(_output.contracts)) {
            for (const contract of Object.values(contracts)) {
                contract.abi = contract.abi.filter(v => v.type !== 'receive');
            }
        }
        return _output;
    }
}
exports.SolcWrapperV06 = SolcWrapperV06;
//# sourceMappingURL=solc_wrapper_v06.js.map