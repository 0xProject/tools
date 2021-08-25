import { Ajv } from 'ajv';
/**
 * A validator wrapping (AJV) [https://github.com/ajv-validator/ajv]
 */
export declare class SchemaValidator {
    private readonly _validator;
    /**
     * Instantiates a SchemaValidator instance
     */
    constructor(newSchemas?: object[]);
    /**
     * Add a schema to the validator. All schemas and sub-schemas must be added to
     * the validator before the `validate` and `isValid` methods can be called with
     * instances of that schema.
     * @param schema The schema to add
     */
    addSchema(schemaObjectOrArray: object | object[]): void;
    /**
     * Validate the JS object conforms to a specific JSON schema
     * @param instance JS object in question
     * @param schema Schema to check against
     * @returns The results of the validation
     */
    validate(instance: any, schema: object): Ajv;
    /**
     * Check whether an instance properly adheres to a JSON schema
     * @param instance JS object in question
     * @param schema Schema to check against
     * @returns Whether or not the instance adheres to the schema
     */
    isValid(instance: any, schema: object): boolean;
}
//# sourceMappingURL=schema_validator.d.ts.map