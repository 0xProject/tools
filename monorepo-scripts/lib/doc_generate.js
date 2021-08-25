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
const fs = require("fs");
const yargs = require("yargs");
const constants_1 = require("./constants");
const doc_generate_utils_1 = require("./utils/doc_generate_utils");
const utils_1 = require("./utils/utils");
const args = yargs
    .option('package', {
    describe: 'Monorepo sub-package for which to generate DocJSON',
    type: 'string',
    demandOption: true,
})
    .option('config', {
    describe: 'doc generation config file',
    type: 'string',
})
    .example("$0 --package '0x.js'", 'Full usage example').argv;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const packageName = args.package;
    const config = args.config
        ? JSON.parse(fs.readFileSync(args.config, 'utf-8'))
        : constants_1.constants.defaultDocGenConfigs;
    const docGenerateAndUploadUtils = new doc_generate_utils_1.DocGenerateUtils(packageName);
    yield docGenerateAndUploadUtils.generateAndUploadDocsAsync(config);
    process.exit(0);
}))().catch(err => {
    utils_1.utils.log(err);
    process.exit(1);
});
//# sourceMappingURL=doc_generate.js.map