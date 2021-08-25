"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dev_utils_1 = require("@0x/dev-utils");
const chai_1 = require("chai");
const _ = require("lodash");
const extract_docs_1 = require("../src/extract_docs");
const gen_md_1 = require("../src/gen_md");
const random_docs_1 = require("./utils/random_docs");
dev_utils_1.chaiSetup.configure();
// tslint:disable: custom-no-magic-numbers
describe('generateMarkdownFromDocs()', () => {
    const URL_PREFIX = random_docs_1.randomWord();
    const DOCS = {
        contracts: Object.assign({}, _.mapValues(_.groupBy(_.times(_.random(2, 8), () => ((name) => (Object.assign({ name }, random_docs_1.randomContract(name))))(`${random_docs_1.randomWord()}Contract`)), 'name'), g => g[0])),
    };
    let md;
    let mdLines;
    function getMarkdownHeaders(level) {
        const lines = mdLines.filter(line => new RegExp(`^\\s*#{${level}}[^#]`).test(line));
        // tslint:disable-next-line: no-non-null-assertion
        return lines.map(line => /^\s*#+\s*(.+?)\s*$/.exec(line)[1]);
    }
    function getMarkdownLinks() {
        const links = [];
        for (const line of mdLines) {
            const re = /\[[^\]]+\]\(([^)]+)\)/g;
            let m;
            do {
                m = re.exec(line);
                if (m) {
                    links.push(m[1]);
                }
            } while (m);
        }
        return links;
    }
    before(() => {
        md = gen_md_1.generateMarkdownFromDocs(DOCS, { urlPrefix: URL_PREFIX });
        mdLines = md.split('\n');
    });
    it('generates entries for all contracts', () => {
        const headers = getMarkdownHeaders(1);
        for (const [contractName, contract] of Object.entries(DOCS.contracts)) {
            chai_1.expect(headers).to.include(`${contract.kind} \`${contractName}\``);
        }
    });
    it('generates entries for all enums', () => {
        const headers = getMarkdownHeaders(3);
        for (const contract of Object.values(DOCS.contracts)) {
            for (const enumName of Object.keys(contract.enums)) {
                chai_1.expect(headers).to.include(`\`${enumName}\``);
            }
        }
    });
    it('generates entries for all structs', () => {
        const headers = getMarkdownHeaders(3);
        for (const contract of Object.values(DOCS.contracts)) {
            for (const structName of Object.keys(contract.structs)) {
                chai_1.expect(headers).to.include(`\`${structName}\``);
            }
        }
    });
    it('generates entries for all events', () => {
        const headers = getMarkdownHeaders(3);
        for (const contract of Object.values(DOCS.contracts)) {
            for (const event of contract.events) {
                chai_1.expect(headers).to.include(`\`${event.name}\``);
            }
        }
    });
    it('generates entries for all methods', () => {
        const headers = getMarkdownHeaders(3);
        for (const contract of Object.values(DOCS.contracts)) {
            for (const method of contract.methods) {
                if (method.kind === extract_docs_1.FunctionKind.Fallback) {
                    chai_1.expect(headers).to.include(`\`<fallback>\``);
                }
                else if (method.kind === extract_docs_1.FunctionKind.Constructor) {
                    chai_1.expect(headers).to.include(`\`constructor\``);
                }
                else {
                    chai_1.expect(headers).to.include(`\`${method.name}\``);
                }
            }
        }
    });
    it('prefixes all URLs with the prefix', () => {
        const urls = getMarkdownLinks();
        for (const url of urls) {
            chai_1.expect(url.startsWith(URL_PREFIX)).to.be.true;
        }
    });
});
// tslint:disable: max-file-line-count
//# sourceMappingURL=gen_md_test.js.map