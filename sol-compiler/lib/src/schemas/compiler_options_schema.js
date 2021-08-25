"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compilerOptionsSchema = void 0;
exports.compilerOptionsSchema = {
    id: '/CompilerOptions',
    properties: {
        contractsDir: { type: 'string' },
        artifactsDir: { type: 'string' },
        solcVersion: { type: 'string', pattern: '^\\d+.\\d+.\\d+\\+commit\\.[a-f0-9]{8}$' },
        compilerSettings: { type: 'object' },
        contracts: {
            oneOf: [
                {
                    type: 'string',
                    pattern: '^\\*$',
                },
                {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            ],
        },
        useDockerisedSolc: { type: 'boolean' },
        isOfflineMode: { type: 'boolean' },
        shouldSaveStandardInput: { type: 'boolean' },
        shouldCompileIndependently: { type: 'boolean' },
    },
    type: 'object',
    required: [],
    additionalProperties: false,
};
//# sourceMappingURL=compiler_options_schema.js.map