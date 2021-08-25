"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AJV = exports.schemas = exports.SchemaValidator = void 0;
var schema_validator_1 = require("./schema_validator");
Object.defineProperty(exports, "SchemaValidator", { enumerable: true, get: function () { return schema_validator_1.SchemaValidator; } });
var schemas_1 = require("./schemas");
Object.defineProperty(exports, "schemas", { enumerable: true, get: function () { return schemas_1.schemas; } });
const AJV = require("ajv");
exports.AJV = AJV;
module.exports.AJV = AJV;
//# sourceMappingURL=index.js.map