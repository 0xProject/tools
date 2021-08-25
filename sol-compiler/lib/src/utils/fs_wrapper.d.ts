/// <reference types="node" />
import * as fs from 'fs';
export declare const fsWrapper: {
    readdirAsync: typeof fs.readdir.__promisify__;
    readFileAsync: typeof fs.readFile.__promisify__;
    writeFileAsync: typeof fs.writeFile.__promisify__;
    mkdirpAsync: (arg1: string) => Promise<unknown>;
    doesPathExistSync: typeof fs.existsSync;
    rmdirSync: typeof fs.rmdirSync;
    removeFileAsync: typeof fs.unlink.__promisify__;
    statAsync: typeof fs.stat.__promisify__;
    appendFileAsync: typeof fs.appendFile.__promisify__;
    accessAsync: typeof fs.access.__promisify__;
    doesFileExistAsync: (filePath: string) => Promise<boolean>;
};
//# sourceMappingURL=fs_wrapper.d.ts.map