import * as fs from 'fs';
import * as yargs from 'yargs';

import { constants } from './constants';
import { DocGenConfigs } from './types';
import { DocGenerateUtils } from './utils/doc_generate_utils';
import { utils } from './utils/utils';

const args = yargs
    .option('package', {
        describe: 'Monorepo sub-package for which to generate DocJSON',
        type: 'string',
        demandOption: true,
    })
    .option('config', {
        describe: 'doc generation config file',
        type: 'string',
    })
    .example("$0 --package '0x.js'", 'Full usage example').argv;

(async () => {
    const packageName = args.package;
    const config = args.config
        ? (JSON.parse(fs.readFileSync(args.config, 'utf-8')) as DocGenConfigs)
        : constants.defaultDocGenConfigs;

    const docGenerateAndUploadUtils = new DocGenerateUtils(packageName);
    await docGenerateAndUploadUtils.generateAndUploadDocsAsync(config);

    process.exit(0);
})().catch(err => {
    utils.log(err);
    process.exit(1);
});
