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
exports.fsWrapper = void 0;
const fs = require("fs");
const mkdirp = require("mkdirp");
const util_1 = require("util");
exports.fsWrapper = {
    readdirAsync: util_1.promisify(fs.readdir),
    readFileAsync: util_1.promisify(fs.readFile),
    writeFileAsync: util_1.promisify(fs.writeFile),
    mkdirpAsync: util_1.promisify(mkdirp),
    doesPathExistSync: fs.existsSync,
    rmdirSync: fs.rmdirSync,
    removeFileAsync: util_1.promisify(fs.unlink),
    statAsync: util_1.promisify(fs.stat),
    appendFileAsync: util_1.promisify(fs.appendFile),
    accessAsync: util_1.promisify(fs.access),
    doesFileExistAsync: (filePath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield exports.fsWrapper.accessAsync(filePath, 
            // node says we need to use bitwise, but tslint says no:
            fs.constants.F_OK | fs.constants.R_OK);
        }
        catch (err) {
            return false;
        }
        return true;
    }),
};
//# sourceMappingURL=fs_wrapper.js.map