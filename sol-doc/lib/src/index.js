"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMarkdownFromDocs = exports.transformDocs = exports.Visibility = exports.StorageLocation = exports.FunctionKind = exports.extractDocsAsync = exports.ContractKind = void 0;
var extract_docs_1 = require("./extract_docs");
Object.defineProperty(exports, "ContractKind", { enumerable: true, get: function () { return extract_docs_1.ContractKind; } });
Object.defineProperty(exports, "extractDocsAsync", { enumerable: true, get: function () { return extract_docs_1.extractDocsAsync; } });
Object.defineProperty(exports, "FunctionKind", { enumerable: true, get: function () { return extract_docs_1.FunctionKind; } });
Object.defineProperty(exports, "StorageLocation", { enumerable: true, get: function () { return extract_docs_1.StorageLocation; } });
Object.defineProperty(exports, "Visibility", { enumerable: true, get: function () { return extract_docs_1.Visibility; } });
var transform_docs_1 = require("./transform_docs");
Object.defineProperty(exports, "transformDocs", { enumerable: true, get: function () { return transform_docs_1.transformDocs; } });
var gen_md_1 = require("./gen_md");
Object.defineProperty(exports, "generateMarkdownFromDocs", { enumerable: true, get: function () { return gen_md_1.generateMarkdownFromDocs; } });
//# sourceMappingURL=index.js.map