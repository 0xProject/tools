import * as yargs from 'yargs';

const ARGV = yargs
    .option('repo', {
        required: true,
        type: 'string',
    })
    .option('doc-gen-config', {
        describe: 'doc generation config file',
        type: 'string',
    })
    .option('dist-tag', {
        describe: 'dist tag (defaults to latest)',
        type: 'string',
    })
    .option('prerelease', {
        describe: 'prerelease ID',
        type: 'string',
    })
    .option('yes', { default: false, type: 'boolean' })
    .option('franklin', { default: false, type: 'boolean' })
    .option('upload-docs', { default: false, type: 'boolean' })
    .option('auto-commit', { default: true, type: 'boolean' }).argv;

console.log({ ARGV });
