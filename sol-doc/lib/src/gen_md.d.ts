import { SolidityDocs } from './extract_docs';
export interface MarkdownOpts {
    urlPrefix: string;
}
/**
 * Convert JSON docs to markdown.
 */
export declare function generateMarkdownFromDocs(docs: SolidityDocs, opts?: Partial<MarkdownOpts>): string;
//# sourceMappingURL=gen_md.d.ts.map