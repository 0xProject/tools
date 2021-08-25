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
exports.alertDiscordAsync = void 0;
const utils_1 = require("@0x/utils");
const constants_1 = require("../constants");
const utils_2 = require("./utils");
const alertDiscordAsync = (releaseNotes) => __awaiter(void 0, void 0, void 0, function* () {
    const webhookUrl = constants_1.constants.discordAlertWebhookUrl;
    if (webhookUrl === undefined) {
        throw new Error("No discord webhook url, can't alert");
    }
    utils_2.utils.log('Alerting discord...');
    const releasesUrl = `https://github.com/0xProject/${process.env.REPO_NAME}/releases`;
    const payload = {
        content: `New monorepo package released!  View at ${releasesUrl} \n\n ${releaseNotes}`,
    };
    yield utils_1.fetchAsync(webhookUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return;
});
exports.alertDiscordAsync = alertDiscordAsync;
//# sourceMappingURL=discord.js.map