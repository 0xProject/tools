"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = void 0;
const IS_LOCAL_PUBLISH = process.env.IS_LOCAL_PUBLISH === 'true';
const LOCAL_NPM_REGISTRY_URL = 'http://localhost:4873';
const REMOTE_NPM_REGISTRY_URL = 'https://registry.npmjs.org/';
exports.configs = {
    IS_LOCAL_PUBLISH,
    NPM_REGISTRY_URL: IS_LOCAL_PUBLISH ? LOCAL_NPM_REGISTRY_URL : REMOTE_NPM_REGISTRY_URL,
    DOCKER_HUB_ORG: '0xorg',
};
//# sourceMappingURL=configs.js.map