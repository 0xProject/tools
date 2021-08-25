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
exports.DocGenerateUtils = void 0;
const fs_1 = require("fs");
const _ = require("lodash");
const path = require("path");
const promisify_child_process_1 = require("promisify-child-process");
const ts = require("typescript");
const constants_1 = require("../constants");
const utils_1 = require("./utils");
class DocGenerateUtils {
    constructor(packageName) {
        this._packageName = packageName;
        this._monoRepoPkgNameToPath = {};
        const monorepoPackages = utils_1.utils.getPackages(constants_1.constants.monorepoRootPath);
        _.each(monorepoPackages, p => (this._monoRepoPkgNameToPath[p.packageJson.name] = p.location));
        const pkg = _.find(monorepoPackages, monorepoPackage => {
            return _.includes(monorepoPackage.packageJson.name, packageName);
        });
        if (pkg === undefined) {
            throw new Error(`No package found with name ${packageName}`);
        }
        this._packagePath = pkg.location;
        this._packageDir = pkg.location.substring(pkg.location.lastIndexOf('/') + 1);
        if (pkg === undefined) {
            throw new Error(`Couldn't find a package.json for ${packageName}`);
        }
        this._packageJson = pkg.packageJson;
        this._omitExports = _.get(this._packageJson, 'config.postpublish.docOmitExports', []);
        const indexPath = `${this._packagePath}/src/index.ts`;
        const exportInfo = DocGenerateUtils._getExportPathToExportedItems(indexPath, this._omitExports);
        this._exportPathToExportedItems = exportInfo.exportPathToExportedItems;
    }
    /**
     *  Recursively iterate over the TypeDoc JSON object and find all type names
     */
    static _getAllTypeNames(node, typeNames) {
        if (!_.isObject(node)) {
            return typeNames;
        }
        const typeKindStrings = ['Interface', 'Enumeration', 'Type alias'];
        if (_.includes(typeKindStrings, node.kindString)) {
            return [...typeNames, node.name];
        }
        let updatedTypeNames = typeNames;
        _.each(node, nodeValue => {
            if (_.isArray(nodeValue)) {
                _.each(nodeValue, aNode => {
                    updatedTypeNames = DocGenerateUtils._getAllTypeNames(aNode, updatedTypeNames);
                });
            }
            else if (_.isObject(nodeValue)) {
                updatedTypeNames = DocGenerateUtils._getAllTypeNames(nodeValue, updatedTypeNames);
            }
        });
        return updatedTypeNames;
    }
    /**
     * Recursively iterate over the TypeDoc JSON object and find all reference names (i.e types, classNames,
     * objectLiteral names, etc...)
     */
    static _getAllReferenceNames(propertyName, node, referenceNames) {
        if (!_.isObject(node)) {
            return referenceNames;
        }
        let updatedReferenceNames = referenceNames;
        // Some nodes of type reference are for subtypes, which we don't want to return.
        // We therefore filter them out.
        const SUB_TYPE_PROPERTY_NAMES = ['inheritedFrom', 'overwrites', 'extendedTypes', 'implementationOf'];
        const TS_MAPPED_TYPES = ['Partial', 'Promise', 'Readonly', 'Pick', 'Record'];
        if (node.type !== undefined &&
            _.isString(node.type) &&
            node.type === 'reference' &&
            !_.includes(TS_MAPPED_TYPES, node.name) &&
            !_.includes(SUB_TYPE_PROPERTY_NAMES, propertyName)) {
            updatedReferenceNames = _.uniq([...referenceNames, node.name]);
            return updatedReferenceNames;
        }
        _.each(node, (nodeValue, innerPropertyName) => {
            if (_.isArray(nodeValue)) {
                _.each(nodeValue, aNode => {
                    updatedReferenceNames = DocGenerateUtils._getAllReferenceNames(innerPropertyName, aNode, updatedReferenceNames);
                });
            }
            else if (_.isObject(nodeValue)) {
                updatedReferenceNames = DocGenerateUtils._getAllReferenceNames(innerPropertyName, nodeValue, updatedReferenceNames);
            }
        });
        return _.uniq(updatedReferenceNames);
    }
    static _getExportPathToExportedItems(filePath, omitExports) {
        const sourceFile = ts.createSourceFile('indexFile', fs_1.readFileSync(filePath).toString(), ts.ScriptTarget.ES2017, 
        /*setParentNodes */ true);
        const exportPathToExportedItems = {};
        const exportPathOrder = [];
        const exportsToOmit = omitExports === undefined ? [] : omitExports;
        processNode(sourceFile);
        function processNode(node) {
            switch (node.kind) {
                case ts.SyntaxKind.ExportDeclaration: {
                    const exportClause = node.exportClause;
                    if (exportClause === undefined) {
                        return;
                    }
                    const exportPath = exportClause.parent &&
                        exportClause.parent.moduleSpecifier &&
                        exportClause.parent.moduleSpecifier.text;
                    if (!exportPath) {
                        return;
                    }
                    _.each(exportClause.elements, element => {
                        const exportItem = element.name.escapedText;
                        if (!_.includes(exportsToOmit, exportItem)) {
                            exportPathToExportedItems[exportPath] =
                                exportPathToExportedItems[exportPath] === undefined
                                    ? [exportItem]
                                    : [...exportPathToExportedItems[exportPath], exportItem];
                        }
                    });
                    if (exportPathToExportedItems[exportPath] !== undefined) {
                        exportPathOrder.push(exportPath);
                    }
                    break;
                }
                case ts.SyntaxKind.ExportKeyword: {
                    const foundNode = node;
                    let exportPath = './index';
                    if (foundNode.parent && foundNode.parent.name) {
                        const exportItem = foundNode.parent.name.escapedText;
                        const isExportImportRequireStatement = _.get(foundNode, 'parent.moduleReference.expression.text') !== undefined;
                        if (isExportImportRequireStatement) {
                            exportPath = foundNode.parent.moduleReference.expression.text;
                        }
                        if (!_.includes(exportsToOmit, exportItem)) {
                            exportPathToExportedItems[exportPath] =
                                exportPathToExportedItems[exportPath] === undefined
                                    ? [exportItem]
                                    : [...exportPathToExportedItems[exportPath], exportItem];
                        }
                    }
                    if (!_.includes(exportPathOrder, exportPath) &&
                        exportPathToExportedItems[exportPath] !== undefined) {
                        exportPathOrder.push(exportPath);
                    }
                    break;
                }
                default:
                    // noop
                    break;
            }
            ts.forEachChild(node, processNode);
        }
        const exportInfo = {
            exportPathToExportedItems,
            exportPathOrder,
        };
        return exportInfo;
    }
    generateAndUploadDocsAsync(docGenConfigs) {
        return __awaiter(this, void 0, void 0, function* () {
            // For each dep that is another one of our monorepo packages, we fetch it's index.ts
            // and see which specific files we must pass to TypeDoc, in order to generate a Doc JSON
            // the includes everything exported by the public interface.
            const typeDocExtraFileIncludes = this._getTypeDocFileIncludesForPackage();
            // In order to avoid TS errors, we need to pass TypeDoc the package's global.d.ts file
            // if it exists.
            const globalTypeDefinitionsPath = path.join(this._packagePath, 'src', 'globals.d.ts');
            if (fs_1.existsSync(globalTypeDefinitionsPath)) {
                typeDocExtraFileIncludes.push(globalTypeDefinitionsPath);
            }
            utils_1.utils.log(`GENERATE_DOCS: Generating Typedoc JSON for ${this._packageName}...`);
            const jsonFilePath = path.join(this._packagePath, 'generated_docs', 'index.json');
            const mdFileDir = path.join(this._packagePath, 'docs');
            const mdReferencePath = `${mdFileDir}/reference.mdx`;
            const projectFiles = typeDocExtraFileIncludes.join(' ');
            const cwd = this._packagePath;
            // HACK: For some reason calling `typedoc` command directly from here, even with `cwd` set to the
            // packages root dir, does not work. It only works when called via a `package.json` script located
            // in the package's root.
            yield promisify_child_process_1.exec(`JSON_FILE_PATH=${jsonFilePath} PROJECT_FILES="${projectFiles}" npm run docs:json`, {
                cwd,
            });
            utils_1.utils.log(`GENERATE_DOCS: Generating Typedoc Markdown for ${this._packageName}...`);
            yield promisify_child_process_1.exec(`MD_FILE_DIR=${mdFileDir} PROJECT_FILES="${projectFiles}" npm run docs:md`, {
                cwd,
            });
            utils_1.utils.log('GENERATE_DOCS: Modifying Markdown To Exclude Unexported Items...');
            const typedocOutputString = fs_1.readFileSync(jsonFilePath).toString();
            const markdownOutputString = fs_1.readFileSync(mdReferencePath).toString();
            const typedocOutput = JSON.parse(typedocOutputString);
            const standardizedTypedocOutput = this._standardizeTypedocOutputTopLevelChildNames(typedocOutput);
            const { modifiedTypedocOutput, modifiedMarkdownOutput } = this._pruneTypedocOutput(standardizedTypedocOutput, markdownOutputString);
            if (!_.includes(docGenConfigs.typesOnlyLibraries, this._packageName)) {
                const propertyName = ''; // Root has no property name
                const referenceNames = DocGenerateUtils._getAllReferenceNames(propertyName, modifiedTypedocOutput, []);
                this._lookForUnusedExportedTypesThrowIfExists(referenceNames, modifiedTypedocOutput, docGenConfigs);
                this._lookForMissingReferenceExportsThrowIfExists(referenceNames, docGenConfigs);
            }
            const exportPathToTypedocNames = {};
            _.each(modifiedTypedocOutput.children, file => {
                const exportPath = this._findExportPathGivenTypedocName(file.name);
                exportPathToTypedocNames[exportPath] =
                    exportPathToTypedocNames[exportPath] === undefined
                        ? [file.name]
                        : [...exportPathToTypedocNames[exportPath], file.name];
            });
            utils_1.utils.log(`GENERATE_DOCS: Delete Doc JSON in: ${jsonFilePath}`);
            fs_1.unlinkSync(jsonFilePath);
            utils_1.utils.log(`GENERATE_DOCS: Saving Doc MD to: ${mdReferencePath}`);
            fs_1.writeFileSync(mdReferencePath, modifiedMarkdownOutput);
            utils_1.utils.log(`GENERATE_DOCS: Doc generation done for ${this._packageName}`);
        });
    }
    /**
     *  Look for types that are used by the public interface but are missing from a package's index.ts
     */
    _lookForMissingReferenceExportsThrowIfExists(referenceNames, docGenConfigs) {
        const allExportedItems = _.flatten(_.values(this._exportPathToExportedItems));
        const missingReferences = [];
        _.each(referenceNames, referenceName => {
            if (!_.includes(allExportedItems, referenceName) &&
                docGenConfigs.externalTypeMap[referenceName] === undefined) {
                missingReferences.push(referenceName);
            }
        });
        if (!_.isEmpty(missingReferences)) {
            throw new Error(`${this._packageName} package needs to export: \n${missingReferences.join(',\n')} \nFrom it\'s index.ts. If any are from external dependencies, then add them to the externalTypeMap.`);
        }
    }
    /**
     * Look for exported types that are not used by the package's public interface
     */
    _lookForUnusedExportedTypesThrowIfExists(referenceNames, typedocOutput, docGenConfigs) {
        const exportedTypes = DocGenerateUtils._getAllTypeNames(typedocOutput, []);
        const excessiveReferences = _.difference(exportedTypes, referenceNames);
        const excessiveReferencesExceptIgnored = _.difference(excessiveReferences, docGenConfigs.ignoredExcessiveTypes);
        if (!_.isEmpty(excessiveReferencesExceptIgnored)) {
            throw new Error(`${this._packageName} package exports BUT does not need: \n${excessiveReferencesExceptIgnored.join('\n')} \nin it\'s index.ts. Remove them then try again OR if we still want them exported (e.g error enum types), then add them to the ignoredExcessiveTypes array.`);
        }
    }
    /**
     *  For each entry in the TypeDoc JSON, remove it if:
     * - it was not exported in index.ts
     * - the constructor is to be ignored
     * - it begins with an underscore (i.e is private)
     */
    _pruneTypedocOutput(typedocOutput, markdownOutput) {
        const modifiedTypedocOutput = _.cloneDeep(typedocOutput);
        let modifiedMarkdownOutput = markdownOutput;
        _.each(typedocOutput.children, (file, i) => {
            const exportPath = this._findExportPathGivenTypedocName(file.name);
            const exportItems = this._exportPathToExportedItems[exportPath];
            _.each(file.children, (child, j) => {
                const isNotExported = !_.includes(exportItems, child.name);
                if (isNotExported) {
                    const item = typedocOutput.children[i].children[j];
                    let regexp;
                    switch (item.kindString) {
                        case 'Interface':
                            regexp = new RegExp(`(.*)# Interface: ${item.name}[\\s\\S]*?<hr \\/>`, 'g');
                            modifiedMarkdownOutput = modifiedMarkdownOutput.replace(regexp, '');
                            break;
                        case 'Enumeration':
                            regexp = new RegExp(`(.*)# Enumeration: ${item.name}[\\s\\S]*?<hr \\/>`, 'g');
                            modifiedMarkdownOutput = modifiedMarkdownOutput.replace(regexp, '');
                            break;
                        case 'Class':
                            regexp = new RegExp(`(.*)# Class: ${item.name}[\\s\\S]*?<hr \\/>`, 'g');
                            modifiedMarkdownOutput = modifiedMarkdownOutput.replace(regexp, '');
                            break;
                        case 'Type alias':
                            regexp = new RegExp(`(.*)#  ${item.name}[\\s\\S]*?(___|<hr \\/>)`, 'g');
                            modifiedMarkdownOutput = modifiedMarkdownOutput.replace(regexp, '');
                            break;
                        default:
                        // Noop
                    }
                    delete modifiedTypedocOutput.children[i].children[j];
                    return;
                }
                const innerChildren = typedocOutput.children[i].children[j].children;
                _.each(innerChildren, (innerChild, k) => {
                    const isPrivate = _.startsWith(innerChild.name, '_');
                    if (isPrivate) {
                        delete modifiedTypedocOutput.children[i].children[j].children[k];
                    }
                });
                modifiedTypedocOutput.children[i].children[j].children = _.compact(modifiedTypedocOutput.children[i].children[j].children);
            });
            modifiedTypedocOutput.children[i].children = _.compact(modifiedTypedocOutput.children[i].children);
        });
        return {
            modifiedTypedocOutput,
            modifiedMarkdownOutput,
        };
    }
    /**
     * Unfortunately TypeDoc children names will only be prefixed with the name of the package _if_ we passed
     * TypeDoc files outside of the packages root path (i.e this package exports another package from our
     * monorepo). In order to enforce that the names are always prefixed with the package's name, we check and add
     * them here when necessary.
     */
    _standardizeTypedocOutputTopLevelChildNames(typedocOutput) {
        const modifiedTypedocOutput = _.cloneDeep(typedocOutput);
        _.each(typedocOutput.children, (child, i) => {
            if (!_.includes(child.name, '/src/')) {
                const nameWithoutQuotes = child.name.replace(/"/g, '');
                const standardizedName = `"${this._packageDir}/src/${nameWithoutQuotes}"`;
                modifiedTypedocOutput.children[i].name = standardizedName;
            }
        });
        return modifiedTypedocOutput;
    }
    /**
     * Maps back each top-level TypeDoc JSON object name to the exportPath from which it was generated.
     */
    _findExportPathGivenTypedocName(typedocName) {
        let typeDocNameWithoutQuotes = _.replace(typedocName, /"/g, '');
        if (typeDocNameWithoutQuotes.startsWith('contracts/')) {
            // tslint:disable-next-line:custom-no-magic-numbers
            typeDocNameWithoutQuotes = typeDocNameWithoutQuotes.substring(10);
        }
        else if (typeDocNameWithoutQuotes.startsWith('packages/')) {
            // tslint:disable-next-line:custom-no-magic-numbers
            typeDocNameWithoutQuotes = typeDocNameWithoutQuotes.substring(9);
        }
        const sanitizedExportPathToExportPath = {};
        const exportPaths = _.keys(this._exportPathToExportedItems);
        const sanitizedExportPaths = _.map(exportPaths, exportPath => {
            if (_.startsWith(exportPath, './')) {
                const sanitizedExportPath = path.join(this._packageDir, 'src', exportPath);
                sanitizedExportPathToExportPath[sanitizedExportPath] = exportPath;
                return sanitizedExportPath;
            }
            const monorepoPrefix = '@0x/';
            if (_.startsWith(exportPath, monorepoPrefix)) {
                let sanitizedExportPath = exportPath.split(monorepoPrefix)[1];
                if (sanitizedExportPath.startsWith('contracts-')) {
                    sanitizedExportPath = sanitizedExportPath.replace('contracts-', '');
                }
                sanitizedExportPathToExportPath[sanitizedExportPath] = exportPath;
                return sanitizedExportPath;
            }
            sanitizedExportPathToExportPath[exportPath] = exportPath;
            return exportPath;
        });
        // We need to sort the exportPaths by length (longest first), so that the match finding will pick
        // longer matches before shorter matches, since it might match both, but the longer match is more
        // precisely what we are looking for.
        const sanitizedExportPathsSortedByLength = sanitizedExportPaths.sort((a, b) => {
            return b.length - a.length;
        });
        const matchingSanitizedExportPathIfExists = _.find(sanitizedExportPathsSortedByLength, p => {
            return _.startsWith(typeDocNameWithoutQuotes, p);
        });
        if (matchingSanitizedExportPathIfExists === undefined) {
            throw new Error(`Didn't find an exportPath for ${typeDocNameWithoutQuotes} ${sanitizedExportPathsSortedByLength}`);
        }
        const matchingExportPath = sanitizedExportPathToExportPath[matchingSanitizedExportPathIfExists];
        return matchingExportPath;
    }
    _getTypeDocFileIncludesForPackage() {
        let typeDocExtraFileIncludes = [];
        _.each(this._exportPathToExportedItems, (exportedItems, exportPath) => {
            const isInternalToPkg = _.startsWith(exportPath, '.');
            if (isInternalToPkg) {
                const pathToInternalPkg = path.join(this._packagePath, 'src', `${exportPath}.ts`);
                typeDocExtraFileIncludes.push(pathToInternalPkg);
                return;
            }
            const pathIfExists = this._monoRepoPkgNameToPath[exportPath];
            if (pathIfExists === undefined) {
                return; // It's an external package
            }
            const typeDocSourceIncludes = new Set();
            const pathToIndex = `${pathIfExists}/src/index.ts`;
            const exportInfo = DocGenerateUtils._getExportPathToExportedItems(pathToIndex);
            const innerExportPathToExportedItems = exportInfo.exportPathToExportedItems;
            _.each(exportedItems, exportName => {
                _.each(innerExportPathToExportedItems, (innerExportItems, innerExportPath) => {
                    if (!_.includes(innerExportItems, exportName)) {
                        return;
                    }
                    if (!_.startsWith(innerExportPath, './')) {
                        throw new Error(`GENERATE_DOCS: WARNING - ${this._packageName} is exporting one of ${innerExportItems} from a package which is itself exporting from another\
                            internal package ${innerExportPath}. To fix this, export the dependency directly from ${innerExportPath}\
                            instead of the intermediate package.`);
                    }
                    else {
                        const absoluteSrcPath = path.join(pathIfExists, 'src', `${innerExportPath}.ts`);
                        typeDocSourceIncludes.add(absoluteSrcPath);
                    }
                });
            });
            // @0x/types & ethereum-types are examples of packages where their index.ts exports types
            // directly, meaning no internal paths will exist to follow. Other packages also have direct exports
            // in their index.ts, so we always add it to the source files passed to TypeDoc
            if (typeDocSourceIncludes.size === 0) {
                typeDocSourceIncludes.add(pathToIndex);
            }
            typeDocExtraFileIncludes = [...typeDocExtraFileIncludes, ...Array.from(typeDocSourceIncludes)];
        });
        return typeDocExtraFileIncludes;
    }
}
exports.DocGenerateUtils = DocGenerateUtils;
//# sourceMappingURL=doc_generate_utils.js.map