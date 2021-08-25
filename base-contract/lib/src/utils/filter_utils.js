"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUtils = void 0;
const utils_1 = require("@0x/utils");
const ethUtil = require("ethereumjs-util");
const jsSHA3 = require("js-sha3");
const uuid = require("uuid/v4");
const TOPIC_LENGTH = 32;
exports.filterUtils = {
    generateUUID() {
        return uuid();
    },
    getFilter(address, eventName, indexFilterValues, abi, blockRange) {
        // tslint:disable:next-line no-unnecessary-type-assertion
        const eventAbi = abi.find(abiDefinition => abiDefinition.name === eventName);
        const eventSignature = exports.filterUtils.getEventSignatureFromAbiByName(eventAbi);
        const topicForEventSignature = ethUtil.addHexPrefix(jsSHA3.keccak256(eventSignature));
        const topicsForIndexedArgs = exports.filterUtils.getTopicsForIndexedArgs(eventAbi, indexFilterValues);
        const topics = [topicForEventSignature, ...topicsForIndexedArgs];
        let filter = {
            address,
            topics,
        };
        if (blockRange !== undefined) {
            filter = Object.assign(Object.assign({}, blockRange), filter);
        }
        return filter;
    },
    getEventSignatureFromAbiByName(eventAbi) {
        const types = eventAbi.inputs.map(i => i.type);
        const signature = `${eventAbi.name}(${types.join(',')})`;
        return signature;
    },
    getTopicsForIndexedArgs(abi, indexFilterValues) {
        const topics = [];
        for (const eventInput of abi.inputs) {
            if (!eventInput.indexed) {
                continue;
            }
            if (indexFilterValues[eventInput.name] === undefined) {
                // Null is a wildcard topic in a JSON-RPC call
                topics.push(null);
            }
            else {
                // tslint:disable: no-unnecessary-type-assertion
                let value = indexFilterValues[eventInput.name];
                if (utils_1.BigNumber.isBigNumber(value)) {
                    // tslint:disable-next-line custom-no-magic-numbers
                    value = ethUtil.fromSigned(value.toString(10));
                }
                // tslint:enable: no-unnecessary-type-assertion
                const buffer = ethUtil.toBuffer(value);
                const paddedBuffer = ethUtil.setLengthLeft(buffer, TOPIC_LENGTH);
                const topic = ethUtil.bufferToHex(paddedBuffer);
                topics.push(topic);
            }
        }
        return topics;
    },
    matchesFilter(log, filter) {
        if (filter.address !== undefined && log.address !== filter.address) {
            return false;
        }
        if (filter.topics !== undefined) {
            return exports.filterUtils.doesMatchTopics(log.topics, filter.topics);
        }
        return true;
    },
    doesMatchTopics(logTopics, filterTopics) {
        const matchesTopic = logTopics.map((logTopic, i) => exports.filterUtils.matchesTopic(logTopic, filterTopics[i]));
        const doesMatchTopics = matchesTopic.every(m => m);
        return doesMatchTopics;
    },
    matchesTopic(logTopic, filterTopic) {
        if (Array.isArray(filterTopic)) {
            return filterTopic.includes(logTopic);
        }
        if (typeof filterTopic === 'string') {
            return filterTopic === logTopic;
        }
        // null topic is a wildcard
        return true;
    },
};
//# sourceMappingURL=filter_utils.js.map