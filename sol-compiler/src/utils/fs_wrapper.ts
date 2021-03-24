import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { promisify } from 'util';

export const fsWrapper = {
    readdirAsync: promisify(fs.readdir),
    readFileAsync: promisify(fs.readFile),
    writeFileAsync: promisify(fs.writeFile),
    mkdirpAsync: promisify(mkdirp),
    doesPathExistSync: fs.existsSync,
    rmdirSync: fs.rmdirSync,
    removeFileAsync: promisify(fs.unlink),
    statAsync: promisify(fs.stat),
    appendFileAsync: promisify(fs.appendFile),
    accessAsync: promisify(fs.access),
    doesFileExistAsync: async (filePath: string): Promise<boolean> => {
        try {
            await fsWrapper.accessAsync(
                filePath,
                // node says we need to use bitwise, but tslint says no:
                fs.constants.F_OK | fs.constants.R_OK, // tslint:disable-line:no-bitwise
            );
        } catch (err) {
            return false;
        }
        return true;
    },
};
