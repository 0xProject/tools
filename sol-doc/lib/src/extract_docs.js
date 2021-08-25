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
exports.extractDocsAsync = exports.Visibility = exports.StorageLocation = exports.StateMutability = exports.FunctionKind = exports.ContractKind = void 0;
const sol_compiler_1 = require("@0x/sol-compiler");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const sol_ast_1 = require("./sol_ast");
var sol_ast_2 = require("./sol_ast");
Object.defineProperty(exports, "ContractKind", { enumerable: true, get: function () { return sol_ast_2.ContractKind; } });
Object.defineProperty(exports, "FunctionKind", { enumerable: true, get: function () { return sol_ast_2.FunctionKind; } });
Object.defineProperty(exports, "StateMutability", { enumerable: true, get: function () { return sol_ast_2.StateMutability; } });
Object.defineProperty(exports, "StorageLocation", { enumerable: true, get: function () { return sol_ast_2.StorageLocation; } });
Object.defineProperty(exports, "Visibility", { enumerable: true, get: function () { return sol_ast_2.Visibility; } });
/**
 * Extract documentation, as JSON, from contract files.
 */
function extractDocsAsync(contractPaths, roots = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputs = yield compileAsync(contractPaths);
        const sourceContents = (yield Promise.all(outputs.map(getSourceContentsFromCompilerOutputAsync))).map(sources => rewriteSourcePaths(sources, roots));
        const docs = createEmptyDocs();
        outputs.forEach((output, outputIdx) => {
            for (const file of Object.keys(output.contracts)) {
                const fileDocs = extractDocsFromFile(output.sources[file].ast, sourceContents[outputIdx][output.sources[file].id]);
                mergeDocs(docs, fileDocs);
            }
        });
        return docs;
    });
}
exports.extractDocsAsync = extractDocsAsync;
function compileAsync(files) {
    return __awaiter(this, void 0, void 0, function* () {
        const compiler = new sol_compiler_1.Compiler({
            contracts: files,
            compilerSettings: {
                outputSelection: {
                    '*': {
                        '*': ['metadata'],
                        '': ['ast'],
                    },
                },
            },
        });
        return compiler.getCompilerOutputsAsync();
    });
}
function getSourceContentsFromCompilerOutputAsync(output) {
    return __awaiter(this, void 0, void 0, function* () {
        const sources = [];
        for (const [importFile, fileOutput] of Object.entries(output.contracts)) {
            if (importFile in sources) {
                continue;
            }
            for (const contractOutput of Object.values(fileOutput)) {
                const metadata = JSON.parse(contractOutput.metadata || '{}');
                let filePath = importFile;
                if (!path.isAbsolute(filePath)) {
                    const { remappings } = metadata.settings;
                    let longestPrefix = '';
                    let longestPrefixReplacement = '';
                    for (const remapping of remappings) {
                        const [from, to] = remapping.substr(1).split('=');
                        if (longestPrefix.length < from.length) {
                            if (filePath.startsWith(from)) {
                                longestPrefix = from;
                                longestPrefixReplacement = to;
                            }
                        }
                    }
                    filePath = filePath.slice(longestPrefix.length);
                    filePath = path.join(longestPrefixReplacement, filePath);
                }
                const content = yield util_1.promisify(fs.readFile)(filePath, { encoding: 'utf-8' });
                sources[output.sources[importFile].id] = {
                    path: path.relative('.', filePath),
                    content,
                };
            }
        }
        return sources;
    });
}
function rewriteSourcePaths(sources, roots) {
    const _roots = roots.map(root => root.split('='));
    return sources.map(s => {
        let longestPrefix = '';
        let longestPrefixReplacement = '';
        for (const [from, to] of _roots) {
            if (from.length > longestPrefix.length) {
                if (s.path.startsWith(from)) {
                    longestPrefix = from;
                    longestPrefixReplacement = to || '';
                }
            }
        }
        return Object.assign(Object.assign({}, s), { path: `${longestPrefixReplacement}${s.path.substr(longestPrefix.length)}` });
    });
}
function mergeDocs(dst, ...srcs) {
    if (srcs.length === 0) {
        return dst;
    }
    for (const src of srcs) {
        dst.contracts = Object.assign(Object.assign({}, dst.contracts), src.contracts);
    }
    return dst;
}
function createEmptyDocs() {
    return { contracts: {} };
}
function extractDocsFromFile(ast, source) {
    const HIDDEN_VISIBILITIES = [sol_ast_1.Visibility.Private, sol_ast_1.Visibility.Internal];
    const docs = createEmptyDocs();
    const visit = (node, currentContractName) => {
        const { offset } = sol_ast_1.splitAstNodeSrc(node.src);
        if (sol_ast_1.isSourceUnitNode(node)) {
            for (const child of node.nodes) {
                visit(child);
            }
        }
        else if (sol_ast_1.isContractDefinitionNode(node)) {
            const natspec = getNatspecBefore(source.content, offset);
            docs.contracts[node.name] = {
                file: source.path,
                line: getAstNodeLineNumber(node, source.content),
                doc: natspec.dev || natspec.comment,
                kind: node.contractKind,
                inherits: node.baseContracts.map(c => normalizeType(c.baseName.typeDescriptions.typeString)),
                methods: [],
                events: [],
                enums: {},
                structs: {},
            };
            for (const child of node.nodes) {
                visit(child, node.name);
            }
        }
        else if (!currentContractName) {
            return;
        }
        else if (sol_ast_1.isVariableDeclarationNode(node)) {
            if (HIDDEN_VISIBILITIES.includes(node.visibility)) {
                return;
            }
            if (!node.stateVariable) {
                return;
            }
            const natspec = getNatspecBefore(source.content, offset);
            docs.contracts[currentContractName].methods.push({
                file: source.path,
                line: getAstNodeLineNumber(node, source.content),
                doc: getDocStringAround(source.content, offset),
                name: node.name,
                contract: currentContractName,
                kind: sol_ast_1.FunctionKind.Function,
                visibility: sol_ast_1.Visibility.External,
                parameters: extractAcessorParameterDocs(node.typeName, natspec, source),
                returns: extractAccesorReturnDocs(node.typeName, natspec, source),
                stateMutability: sol_ast_1.StateMutability.View,
                isAccessor: true,
            });
        }
        else if (sol_ast_1.isFunctionDefinitionNode(node)) {
            const natspec = getNatspecBefore(source.content, offset);
            docs.contracts[currentContractName].methods.push({
                file: source.path,
                line: getAstNodeLineNumber(node, source.content),
                doc: natspec.dev || natspec.comment || getCommentsBefore(source.content, offset),
                name: node.name,
                contract: currentContractName,
                kind: node.kind,
                visibility: node.visibility,
                parameters: extractFunctionParameterDocs(node.parameters, natspec, source),
                returns: extractFunctionReturnDocs(node.returnParameters, natspec, source),
                stateMutability: node.stateMutability,
                isAccessor: false,
            });
        }
        else if (sol_ast_1.isStructDefinitionNode(node)) {
            const natspec = getNatspecBefore(source.content, offset);
            docs.contracts[currentContractName].structs[node.canonicalName] = {
                contract: currentContractName,
                file: source.path,
                line: getAstNodeLineNumber(node, source.content),
                doc: natspec.dev || natspec.comment || getCommentsBefore(source.content, offset),
                fields: extractStructFieldDocs(node.members, natspec, source),
            };
        }
        else if (sol_ast_1.isEnumDefinitionNode(node)) {
            const natspec = getNatspecBefore(source.content, offset);
            docs.contracts[currentContractName].enums[node.canonicalName] = {
                contract: currentContractName,
                file: source.path,
                line: getAstNodeLineNumber(node, source.content),
                doc: natspec.dev || natspec.comment || getCommentsBefore(source.content, offset),
                values: extractEnumValueDocs(node.members, natspec, source),
            };
        }
        else if (sol_ast_1.isEventDefinitionNode(node)) {
            const natspec = getNatspecBefore(source.content, offset);
            docs.contracts[currentContractName].events.push({
                contract: currentContractName,
                file: source.path,
                line: getAstNodeLineNumber(node, source.content),
                doc: natspec.dev || natspec.comment || getCommentsBefore(source.content, offset),
                name: node.name,
                parameters: extractFunctionParameterDocs(node.parameters, natspec, source),
            });
        }
    };
    visit(ast);
    return docs;
}
function extractAcessorParameterDocs(typeNameNode, natspec, source) {
    const params = {};
    const lineNumber = getAstNodeLineNumber(typeNameNode, source.content);
    if (sol_ast_1.isMappingTypeNameNode(typeNameNode)) {
        // Handle mappings.
        let node = typeNameNode;
        let order = 0;
        do {
            const paramName = `${Object.keys(params).length}`;
            params[paramName] = {
                file: source.path,
                line: lineNumber,
                doc: natspec.params[paramName] || '',
                type: normalizeType(node.keyType.typeDescriptions.typeString),
                indexed: false,
                storageLocation: sol_ast_1.StorageLocation.Default,
                order: order++,
            };
            node = node.valueType;
        } while (sol_ast_1.isMappingTypeNameNode(node));
    }
    else if (sol_ast_1.isArrayTypeNameNode(typeNameNode)) {
        // Handle arrays.
        let node = typeNameNode;
        let order = 0;
        do {
            const paramName = `${Object.keys(params).length}`;
            params[paramName] = {
                file: source.path,
                line: lineNumber,
                doc: natspec.params[paramName] || '',
                type: 'uint256',
                indexed: false,
                storageLocation: sol_ast_1.StorageLocation.Default,
                order: order++,
            };
            node = node.baseType;
        } while (sol_ast_1.isArrayTypeNameNode(node));
    }
    return params;
}
function extractAccesorReturnDocs(typeNameNode, natspec, source) {
    let type = typeNameNode.typeDescriptions.typeString;
    let storageLocation = sol_ast_1.StorageLocation.Default;
    if (sol_ast_1.isMappingTypeNameNode(typeNameNode)) {
        // Handle mappings.
        let node = typeNameNode;
        while (sol_ast_1.isMappingTypeNameNode(node.valueType)) {
            node = node.valueType;
        }
        type = node.valueType.typeDescriptions.typeString;
        storageLocation = type.startsWith('struct') ? sol_ast_1.StorageLocation.Memory : sol_ast_1.StorageLocation.Default;
    }
    else if (sol_ast_1.isArrayTypeNameNode(typeNameNode)) {
        // Handle arrays.
        type = typeNameNode.baseType.typeDescriptions.typeString;
        storageLocation = type.startsWith('struct') ? sol_ast_1.StorageLocation.Memory : sol_ast_1.StorageLocation.Default;
    }
    else if (sol_ast_1.isUserDefinedTypeNameNode(typeNameNode)) {
        storageLocation = typeNameNode.typeDescriptions.typeString.startsWith('struct')
            ? sol_ast_1.StorageLocation.Memory
            : sol_ast_1.StorageLocation.Default;
    }
    return {
        '0': {
            storageLocation,
            type: normalizeType(type),
            file: source.path,
            line: getAstNodeLineNumber(typeNameNode, source.content),
            doc: natspec.returns['0'] || '',
            indexed: false,
            order: 0,
        },
    };
}
function extractFunctionParameterDocs(paramListNodes, natspec, source) {
    const params = {};
    for (const param of paramListNodes.parameters) {
        params[param.name] = {
            file: source.path,
            line: getAstNodeLineNumber(param, source.content),
            doc: natspec.params[param.name] || '',
            type: normalizeType(param.typeName.typeDescriptions.typeString),
            indexed: param.indexed,
            storageLocation: param.storageLocation,
            order: 0,
        };
    }
    return params;
}
function extractFunctionReturnDocs(paramListNodes, natspec, source) {
    const returns = {};
    let order = 0;
    for (const [idx, param] of Object.entries(paramListNodes.parameters)) {
        returns[param.name || idx] = {
            file: source.path,
            line: getAstNodeLineNumber(param, source.content),
            doc: natspec.returns[param.name || idx] || '',
            type: normalizeType(param.typeName.typeDescriptions.typeString),
            indexed: false,
            storageLocation: param.storageLocation,
            order: order++,
        };
    }
    return returns;
}
function extractStructFieldDocs(fieldNodes, natspec, source) {
    const fields = {};
    let order = 0;
    for (const field of fieldNodes) {
        const { offset } = sol_ast_1.splitAstNodeSrc(field.src);
        fields[field.name] = {
            file: source.path,
            line: getAstNodeLineNumber(field, source.content),
            doc: natspec.params[field.name] || getDocStringAround(source.content, offset),
            type: normalizeType(field.typeName.typeDescriptions.typeString),
            indexed: false,
            storageLocation: field.storageLocation,
            order: order++,
        };
    }
    return fields;
}
function extractEnumValueDocs(valuesNodes, natspec, source) {
    const values = {};
    for (const value of valuesNodes) {
        const { offset } = sol_ast_1.splitAstNodeSrc(value.src);
        values[value.name] = {
            file: source.path,
            line: getAstNodeLineNumber(value, source.content),
            doc: natspec.params[value.name] || getDocStringAround(source.content, offset),
            value: Object.keys(values).length,
        };
    }
    return values;
}
function offsetToLineIndex(code, offset) {
    let currentOffset = 0;
    let lineIdx = 0;
    while (currentOffset <= offset) {
        const lineEnd = code.indexOf('\n', currentOffset);
        if (lineEnd === -1) {
            return lineIdx;
        }
        currentOffset = lineEnd + 1;
        ++lineIdx;
    }
    return lineIdx - 1;
}
function offsetToLine(code, offset) {
    let lineEnd = code.substr(offset).search(/\r?\n/);
    lineEnd = lineEnd === -1 ? code.length - offset : lineEnd;
    let lineStart = code.lastIndexOf('\n', offset);
    lineStart = lineStart === -1 ? 0 : lineStart;
    return code.substr(lineStart, offset - lineStart + lineEnd).trim();
}
function getPrevLine(code, offset) {
    const lineStart = code.lastIndexOf('\n', offset);
    if (lineStart <= 0) {
        return [undefined, 0];
    }
    const prevLineStart = code.lastIndexOf('\n', lineStart - 1);
    if (prevLineStart === -1) {
        return [code.substr(0, lineStart).trim(), 0];
    }
    return [code.substring(prevLineStart + 1, lineStart).trim(), prevLineStart + 1];
}
function getAstNodeLineNumber(node, code) {
    return offsetToLineIndex(code, sol_ast_1.splitAstNodeSrc(node.src).offset) + 1;
}
function getNatspecBefore(code, offset) {
    const natspec = { comment: '', dev: '', params: {}, returns: {} };
    // Walk backwards through the lines until there is no longer a natspec
    // comment.
    let currentDirectivePayloads = [];
    let currentLine;
    let currentOffset = offset;
    while (true) {
        [currentLine, currentOffset] = getPrevLine(code, currentOffset);
        if (currentLine === undefined) {
            break;
        }
        const m = /^\/\/\/\s*(?:@(\w+\b)\s*)?(.*?)$/.exec(currentLine);
        if (!m) {
            break;
        }
        const directive = m[1];
        let directiveParam;
        let rest = m[2] || '';
        // Parse directives that take a parameter.
        if (directive === 'param' || directive === 'return') {
            const m2 = /^(\w+\b)(.*)$/.exec(rest);
            if (m2) {
                directiveParam = m2[1];
                rest = m2[2] || '';
            }
        }
        currentDirectivePayloads.push(rest);
        if (directive !== undefined) {
            const fullPayload = currentDirectivePayloads
                .reverse()
                .map(s => s.trim())
                .join(' ');
            switch (directive) {
                case 'dev':
                    natspec.dev = fullPayload;
                    break;
                case 'param':
                    if (directiveParam) {
                        natspec.params = Object.assign(Object.assign({}, natspec.params), { [directiveParam]: fullPayload });
                    }
                    break;
                case 'return':
                    if (directiveParam) {
                        natspec.returns = Object.assign(Object.assign({}, natspec.returns), { [directiveParam]: fullPayload });
                    }
                    break;
                default:
                    break;
            }
            currentDirectivePayloads = [];
        }
    }
    if (currentDirectivePayloads.length > 0) {
        natspec.comment = currentDirectivePayloads
            .reverse()
            .map(s => s.trim())
            .join(' ');
    }
    return natspec;
}
function getTrailingCommentAt(code, offset) {
    const m = /\/\/\s*(.+)\s*$/.exec(offsetToLine(code, offset));
    return m ? m[1] : '';
}
function getCommentsBefore(code, offset) {
    let currentOffset = offset;
    const comments = [];
    do {
        let prevLine;
        [prevLine, currentOffset] = getPrevLine(code, currentOffset);
        if (prevLine === undefined) {
            break;
        }
        const m = /^\s*\/\/\s*(.+)\s*$/.exec(prevLine);
        if (m && !m[1].startsWith('solhint')) {
            comments.push(m[1].trim());
        }
        else {
            break;
        }
    } while (currentOffset > 0);
    return comments.reverse().join(' ');
}
function getDocStringBefore(code, offset) {
    const natspec = getNatspecBefore(code, offset);
    return natspec.dev || natspec.comment || getCommentsBefore(code, offset);
}
function getDocStringAround(code, offset) {
    const natspec = getNatspecBefore(code, offset);
    return natspec.dev || natspec.comment || getDocStringBefore(code, offset) || getTrailingCommentAt(code, offset);
}
function normalizeType(type) {
    const m = /^(?:\w+ )?(.*)$/.exec(type);
    if (!m) {
        return type;
    }
    return m[1];
}
// tslint:disable-next-line: max-file-line-count
//# sourceMappingURL=extract_docs.js.map