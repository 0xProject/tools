import * as Ajv from 'ajv';
import values = require('lodash.values');

import { schemas } from './schemas';

/**
 * A validator wrapping (AJV) [https://github.com/ajv-validator/ajv]
 */
export class SchemaValidator {
    private readonly _validator: Ajv.Ajv;
    /**
     * Instantiates a SchemaValidator instance
     */
    constructor(newSchemas: object[] = []) {
        this._validator = new Ajv({ schemaId: 'auto' });
        this._validator.addSchema(values(schemas).filter(s => s !== undefined && s.id !== undefined));
        this._validator.addSchema(newSchemas.filter(s => s !== undefined));
    }
    /**
     * Add a schema to the validator. All schemas and sub-schemas must be added to
     * the validator before the `validate` and `isValid` methods can be called with
     * instances of that schema.
     * @param schema The schema to add
     */
    public addSchema(_schemas: object | object[]): void {
        this._validator.addSchema(_schemas); // AJV validates upon adding
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
    public validate(instance: any, schema: object): Ajv.Ajv {
        this.isValid(instance, schema);
        return this._validator; // errors field is returned here. Will be overwritten on the next validation.
    }
    /**
     * Check whether an instance properly adheres to a JSON schema
     * @param instance JS object in question
     * @param schema Schema to check against
     * @returns Whether or not the instance adheres to the schema
     */
    public isValid(instance: any, schema: object): boolean {
        return this._validator.validate(schema, JSON.parse(JSON.stringify(instance))) as boolean;
    }
}
