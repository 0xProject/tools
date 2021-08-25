"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidator = void 0;
const AJV = require("ajv"); // namespace and constructor
const values = require("lodash.values");
const schemas_1 = require("./schemas");
/**
 * A validator wrapping (AJV) [https://github.com/ajv-validator/ajv]
 */
class SchemaValidator {
    /**
     * Instantiates a SchemaValidator instance
     */
    constructor(newSchemas = []) {
        this._validator = new AJV({ schemaId: 'auto', allErrors: true });
        this._validator.addSchema(values(schemas_1.schemas).filter(s => s !== undefined && s.id !== undefined));
        this._validator.addSchema(newSchemas.filter(s => s !== undefined));
    }
    /**
     * Add a schema to the validator. All schemas and sub-schemas must be added to
     * the validator before the `validate` and `isValid` methods can be called with
     * instances of that schema.
     * @param schema The schema to add
     */
    addSchema(schemaObjectOrArray) {
        const _schemas = Array.isArray(schemaObjectOrArray) ? schemaObjectOrArray : [schemaObjectOrArray];
        for (const s of _schemas) {
            try {
                this._validator.addSchema(s); // AJV validates upon adding
            }
            catch (err) {
                // Ignore duplicate errors.
                if (!err.message.endsWith('already exists')) {
                    throw err;
                }
            }
        }
    }
    // In order to validate a complex JS object using jsonschema, we must replace any complex
    // sub-types (e.g BigNumber) with a simpler string representation. Since BigNumber and other
    // complex types implement the `toString` method, we can stringify the object and
    // then parse it. The resultant object can then be checked using jsonschema.
    /**
     * Validate the JS object conforms to a specific JSON schema
     * @param instance JS object in question
     * @param schema Schema to check against
     * @returns The results of the validation
     */
    validate(instance, schema) {
        this.isValid(instance, schema);
        return this._validator; // errors field is returned here. Will be overwritten on the next validation.
    }
    /**
     * Check whether an instance properly adheres to a JSON schema
     * @param instance JS object in question
     * @param schema Schema to check against
     * @returns Whether or not the instance adheres to the schema
     */
    isValid(instance, schema) {
        return this._validator.validate(schema, JSON.parse(JSON.stringify(instance)));
    }
}
exports.SchemaValidator = SchemaValidator;
//# sourceMappingURL=schema_validator.js.map