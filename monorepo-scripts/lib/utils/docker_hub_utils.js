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
exports.dockerHubUtils = void 0;
const utils_1 = require("@0x/utils");
const promisify_child_process_1 = require("promisify-child-process");
const utils_2 = require("./utils");
const API_ENDPOINT = 'https://hub.docker.com/v2';
const HTTP_OK_STATUS = 200;
exports.dockerHubUtils = {
    getTokenAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                username: process.env.DOCKER_USERNAME,
                password: process.env.DOCKER_PASS,
            };
            const response = yield utils_1.fetchAsync(`${API_ENDPOINT}/users/login`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (response.status !== HTTP_OK_STATUS) {
                throw new Error(`DockerHub user login failed (status code: ${response.status}). Make sure you have environment variables 'DOCKER_USERNAME; and 'DOCKER_PASS' set`);
            }
            const respPayload = yield response.json();
            const token = respPayload.token;
            return token;
        });
    },
    checkUserAddedToOrganizationOrThrowAsync(organization) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_2.utils.log('Checking that the user was added to the 0xorg DockerHub organization...');
            const token = yield exports.dockerHubUtils.getTokenAsync();
            const response = yield utils_1.fetchAsync(`${API_ENDPOINT}/repositories/${organization}/?page_size=10`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `JWT ${token}`,
                },
            });
            const respPayload = yield response.json();
            if (response.status !== HTTP_OK_STATUS || respPayload.count === 0) {
                throw new Error(`Failed to fetch org: ${organization}'s list of repos (status code: ${response.status}). Make sure your account has been added to the '${organization}' org on DockerHub`);
            }
        });
    },
    loginUserToDockerCommandlineOrThrowAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                utils_2.utils.log('Checking that the user is logged in to docker command...');
                yield promisify_child_process_1.exec(`echo "$DOCKER_PASS" | docker login -u $DOCKER_USERNAME --password-stdin`);
            }
            catch (err) {
                throw new Error(`Failed to log you into the 'docker' commandline tool. Make sure you have the 'docker' commandline tool installed. Full error: ${err.message}`);
            }
        });
    },
};
//# sourceMappingURL=docker_hub_utils.js.map