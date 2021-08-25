import { SolidityDocs } from './extract_docs';
export interface TransformOpts {
    onlyExposed: boolean;
    flatten: boolean;
    contracts: string[];
}
/**
 * Apply some nice transformations to extracted JSON docs, such as flattening
 * inherited contracts and filtering out unexposed or unused types.
 */
export declare function transformDocs(docs: SolidityDocs, opts?: Partial<TransformOpts>): SolidityDocs;
//# sourceMappingURL=transform_docs.d.ts.map