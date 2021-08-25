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
exports.Subprovider = void 0;
const util_1 = require("util");
/**
 * A altered version of the base class Subprovider found in [web3-provider-engine](https://github.com/MetaMask/provider-engine).
 * This one has an async/await `emitPayloadAsync` and also defined types.
 */
class Subprovider {
    static _createFinalPayload(payload) {
        const finalPayload = Object.assign({ 
            // defaults
            id: Subprovider._getRandomId(), jsonrpc: '2.0', params: [] }, payload);
        return finalPayload;
    }
    // Ported from: https://github.com/MetaMask/provider-engine/blob/master/util/random-id.js
    static _getRandomId() {
        const extraDigits = 3;
        const baseTen = 10;
        // 13 time digits
        const datePart = new Date().getTime() * Math.pow(baseTen, extraDigits);
        // 3 random digits
        const extraPart = Math.floor(Math.random() * Math.pow(baseTen, extraDigits));
        // 16 digits
        return datePart + extraPart;
    }
    /**
     * Emits a JSON RPC payload that will then be handled by the ProviderEngine instance
     * this subprovider is a part of. The payload will cascade down the subprovider middleware
     * stack until finding the responsible entity for handling the request.
     * @param payload JSON RPC payload
     * @returns JSON RPC response payload
     */
    emitPayloadAsync(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const finalPayload = Subprovider._createFinalPayload(payload);
            const sendAsync = util_1.promisify(this.engine.sendAsync.bind(this.engine));
            const response = yield sendAsync(finalPayload);
            return response;
        });
    }
    /**
     * Set's the subprovider's engine to the ProviderEngine it is added to.
     * This is only called within the ProviderEngine source code, do not call
     * directly.
     * @param engine The ProviderEngine this subprovider is added to
     */
    setEngine(engine) {
        this.engine = engine;
    }
}
exports.Subprovider = Subprovider;
//# sourceMappingURL=subprovider.js.map