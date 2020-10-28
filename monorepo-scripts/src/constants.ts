import * as path from 'path';
import * as process from 'process';

import { DocGenConfigs } from './types';

export const constants = {
    monorepoRootPath: process.cwd(),
    stagingWebsite: 'http://staging-0xproject.s3-website-us-east-1.amazonaws.com',
    lernaExecutable: path.join('node_modules', '@0x-lerna-fork', 'lerna', 'cli.js'),
    githubToken: process.env.GITHUB_TOKEN,
    discordAlertWebhookUrl: process.env.DISCORD_GITHUB_RELEASE_WEBHOOK_URL,
    dependenciesUpdatedMessage: 'Dependencies updated',
    // tslint:disable: no-object-literal-type-assertion
    defaultDocGenConfigs: {
        // Versions our doc JSON format so we can handle breaking changes  intelligently
        docJsonVersion: '0.0.1',
        // Some types that are exposed by our package's public interface are external types. As such, we won't
        // be able to render their definitions. Instead we link to them using this lookup.
        externalTypeMap: {
            Array: true,
            Error: true,
            Buffer: true,
            Uint8Array: true,
            IterableIterator: true,
            Set: true,
            Exclude: true,
        },
        // Some types are not explicitly part of the public interface like params, return values, etc... But we still
        // want them exported. E.g error enum types that can be thrown by methods. These must be manually added to this
        // config
        ignoredExcessiveTypes: [],
        // Some libraries only export types. In those cases, we cannot check if the exported types are part of the
        // "exported public interface". Thus we add them here and skip those checks.
        typesOnlyLibraries: [],
    } as DocGenConfigs,
};
