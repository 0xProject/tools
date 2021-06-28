import { BigNumber } from '@0x/utils';
import * as chai from 'chai';
import * as dirtyChai from 'dirty-chai';
import forEach = require('lodash.foreach');
import 'mocha';

import { schemas, SchemaValidator } from '../src/index';

chai.config.includeStack = true;
chai.use(dirtyChai);
const expect = chai.expect;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const CHAIN_ID = 1337;
const {
    numberSchema,
    addressSchema,
    hexSchema,
    orderCancellationRequestsSchema,
    orderFillOrKillRequestsSchema,
    orderFillRequestsSchema,
    orderHashSchema,
    orderSchema,
    signedOrderSchema,
    signedOrdersSchema,
    blockParamSchema,
    blockRangeSchema,
    tokenSchema,
    jsNumber,
    txDataSchema,
    paginatedCollectionSchema,
    wholeNumberSchema,
    v4RfqSignedOrderSchema,
} = schemas;

describe('Schema', () => {
    const validator = new SchemaValidator();
    const validateAgainstSchema = (testCases: any[], schema: any, shouldFail = false) => {
        forEach(testCases, (testCase: any) => {
            const validationResult = validator.validate(testCase, schema);
            const hasErrors = validationResult.errors && validationResult.errors.length !== 0;
            if (shouldFail) {
                if (!hasErrors) {
                    throw new Error(
                        `Expected testCase: ${JSON.stringify(testCase, null, '\t')} to fail and it didn't.`,
                    );
                }
            } else {
                if (hasErrors) {
                    throw new Error(JSON.stringify(validationResult.errors, null, '\t'));
                }
            }
        });
    };
    const paginatedResponse = {
        total: 100,
        perPage: 10,
        page: 3,
    };
    describe('#numberSchema', () => {
        it('should validate valid numbers', () => {
            const testCases = ['42', '0', '1.3', '0.2', '00.00'];
            validateAgainstSchema(testCases, numberSchema);
        });
        it('should fail for invalid numbers', () => {
            const testCases = ['.3', '1.', 'abacaba', 'и', '1..0'];
            const shouldFail = true;
            validateAgainstSchema(testCases, numberSchema, shouldFail);
        });
    });
    describe('#wholeNumberSchema', () => {
        it('should validate valid numbers', () => {
            const testCases = ['5', '42', '0'];
            validateAgainstSchema(testCases, wholeNumberSchema);
        });
        it('should fail for invalid numbers', () => {
            const testCases = ['1.3', '0.2', '00.00', '.3', '1.', 'abacaba', 'и', '1..0'];
            const shouldFail = true;
            validateAgainstSchema(testCases, wholeNumberSchema, shouldFail);
        });
    });
    describe('#addressSchema', () => {
        it('should validate valid addresses', () => {
            const testCases = ['0x8b0292b11a196601ed2ce54b665cafeca0347d42', NULL_ADDRESS];
            validateAgainstSchema(testCases, addressSchema);
        });
        it('should fail for invalid addresses', () => {
            const testCases = ['0x', '0', '0x00', '0xzzzzzzB11a196601eD2ce54B665CaFEca0347D42'];
            const shouldFail = true;
            validateAgainstSchema(testCases, addressSchema, shouldFail);
        });
    });
    describe('#hexSchema', () => {
        it('should validate valid hex string', () => {
            const testCases = ['0x8b0292b11a196601ed2ce54b665cafeca0347d42', NULL_ADDRESS];
            validateAgainstSchema(testCases, hexSchema);
        });
        it('should fail for invalid hex string', () => {
            const testCases = ['0', '0xzzzzzzB11a196601eD2ce54B665CaFEca0347D42'];
            const shouldFail = true;
            validateAgainstSchema(testCases, hexSchema, shouldFail);
        });
    });
    describe('#orderHashSchema', () => {
        it('should validate valid order hash', () => {
            const testCases = [
                '0x61a3ed31B43c8780e905a260a35faefEc527be7516aa11c0256729b5b351bc33',
                '0x40349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',
            ];
            validateAgainstSchema(testCases, orderHashSchema);
        });
        it('should fail for invalid order hash', () => {
            const testCases = [
                {},
                '0x',
                '0x8b0292B11a196601eD2ce54B665CaFEca0347D42',
                '61a3ed31B43c8780e905a260a35faefEc527be7516aa11c0256729b5b351bc33',
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, orderHashSchema, shouldFail);
        });
    });
    describe('#blockParamSchema', () => {
        it('should validate valid block param', () => {
            const blockNumber = 42;
            const testCases = [blockNumber, 'latest', 'pending', 'earliest'];
            validateAgainstSchema(testCases, blockParamSchema);
        });
        it('should fail for invalid block param', () => {
            const testCases = [{}, '42', 'pemding'];
            const shouldFail = true;
            validateAgainstSchema(testCases, blockParamSchema, shouldFail);
        });
    });
    describe('#blockRangeSchema', () => {
        it('should validate valid subscription opts', () => {
            const testCases = [{ fromBlock: 42, toBlock: 'latest' }, { fromBlock: 42 }, {}];
            validateAgainstSchema(testCases, blockRangeSchema);
        });
        it('should fail for invalid subscription opts', () => {
            const testCases = [{ fromBlock: '42' }];
            const shouldFail = true;
            validateAgainstSchema(testCases, blockRangeSchema, shouldFail);
        });
    });
    describe('#V4 RFQ Schema', () => {
        const sampleV4RfqOrder = `
        {
            "expiry": "1609871472",
            "makerAmount": "123660506086783300",
            "takerAmount": "125000000000000000000",
            "makerToken": "0x374a16f5e686c09b0cc9e8bc3466b3b645c74aa7",
            "takerToken": "0xf84830b73b2ed3c7267e7638f500110ea47fdf30",
            "chainId": 3,
            "verifyingContract": "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
            "maker": "0x06754422cf9f54ae0e67D42FD788B33D8eb4c5D5",
            "taker": "0x06652BDD5A8eB3d206caedd6b95b61F820Abb9B1",
            "salt": "1609871232650",
            "txOrigin": "0x06652BDD5A8eB3d206caedd6b95b61F820Abb9B1",
            "pool": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "signature": {
                "r": "0x81483df776387dbc439dd6daee3f365b57f4640f523c24f7e5ebdfd585ba5991",
                "s": "0x140c07f0b775c43c3e048205d1ac1360fb0d3254a48d928b7775a850d29536ff",
                "v": 27,
                "signatureType": 3
            }
        }
        `;

        it('correctly deserializes a V4 RFQ order', () => {
            validateAgainstSchema([JSON.parse(sampleV4RfqOrder)], v4RfqSignedOrderSchema);
        });
    });

    describe('#tokenSchema', () => {
        const token = {
            name: 'Zero Ex',
            symbol: 'ZRX',
            decimals: 100500,
            address: '0x8b0292b11a196601ed2ce54b665cafeca0347d42',
            url: 'https://0xproject.com',
        };
        it('should validate valid token', () => {
            const testCases = [token];
            validateAgainstSchema(testCases, tokenSchema);
        });
        it('should fail for invalid token', () => {
            const num = 4;
            const testCases = [
                {
                    ...token,
                    address: null,
                },
                {
                    ...token,
                    decimals: undefined,
                },
                [],
                num,
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, tokenSchema, shouldFail);
        });
    });
    describe('#paginatedCollectionSchema', () => {
        it('should validate valid paginated collections', () => {
            const testCases = [paginatedResponse];
            validateAgainstSchema(testCases, paginatedCollectionSchema);
        });
        it('should fail for invalid paginated collections', () => {
            const paginatedCollectionNoTotal = {
                page: 10,
                perPage: 2,
            };
            const paginatedCollectionNoPerPage = {
                page: 10,
                total: 100,
            };
            const paginatedCollectionNoPage = {
                total: 10,
                perPage: 20,
            };
            const testCases = [{}, paginatedCollectionNoPage, paginatedCollectionNoPerPage, paginatedCollectionNoTotal];
            const shouldFail = true;
            validateAgainstSchema(testCases, paginatedCollectionSchema, shouldFail);
        });
    });
    describe('order including schemas', () => {
        const order = {
            makerAddress: NULL_ADDRESS,
            takerAddress: NULL_ADDRESS,
            senderAddress: NULL_ADDRESS,
            makerFee: '1',
            takerFee: '2',
            makerAssetAmount: '1',
            takerAssetAmount: '2',
            makerAssetData: NULL_ADDRESS,
            takerAssetData: NULL_ADDRESS,
            makerFeeAssetData: NULL_ADDRESS,
            takerFeeAssetData: NULL_ADDRESS,
            salt: '67006738228878699843088602623665307406148487219438534730168799356281242528500',
            feeRecipientAddress: NULL_ADDRESS,
            expirationTimeSeconds: '42',
            exchangeAddress: NULL_ADDRESS,
            chainId: CHAIN_ID,
        };
        describe('#orderSchema', () => {
            it('should validate valid order', () => {
                const testCases = [order];
                validateAgainstSchema(testCases, orderSchema);
            });
            it('should fail for invalid order', () => {
                const testCases = [
                    {
                        ...order,
                        salt: undefined,
                    },
                    {
                        ...order,
                        salt: 'salt',
                    },
                    'order',
                ];
                const shouldFail = true;
                validateAgainstSchema(testCases, orderSchema, shouldFail);
            });
        });
        describe('signed order including schemas', () => {
            const signedOrder = {
                ...order,
                signature:
                    '0x031b61a3ed31b43c8780e905a260a35faefcc527be7516aa11c0256729b5b351bc3340349190569279751135161d22529dc25add4f6069af05be04cacbda2ace2254',
            };
            describe('#signedOrdersSchema', () => {
                it('should validate valid signed orders', () => {
                    const testCases = [[signedOrder], []];
                    validateAgainstSchema(testCases, signedOrdersSchema);
                });
                it('should fail for invalid signed orders', () => {
                    const testCases = [[signedOrder, 1]];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, signedOrdersSchema, shouldFail);
                });
            });
            describe('#signedOrderSchema', () => {
                it('should validate valid signed order', () => {
                    const testCases = [signedOrder];
                    validateAgainstSchema(testCases, signedOrderSchema);
                });
                it('should fail for invalid signed order', () => {
                    const testCases = [
                        {
                            ...signedOrder,
                            signature: undefined,
                        },
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, signedOrderSchema, shouldFail);
                });
            });
            describe('#orderFillOrKillRequestsSchema', () => {
                const orderFillOrKillRequests = [
                    {
                        signedOrder,
                        fillTakerAmount: '5',
                    },
                ];
                it('should validate valid order fill or kill requests', () => {
                    const testCases = [orderFillOrKillRequests];
                    validateAgainstSchema(testCases, orderFillOrKillRequestsSchema);
                });
                it('should fail for invalid order fill or kill requests', () => {
                    const testCases = [
                        [
                            {
                                ...orderFillOrKillRequests[0],
                                fillTakerAmount: undefined,
                            },
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, orderFillOrKillRequestsSchema, shouldFail);
                });
            });
            describe('#orderCancellationRequestsSchema', () => {
                const orderCancellationRequests = [
                    {
                        order,
                        takerTokenCancelAmount: '5',
                    },
                ];
                it('should validate valid order cancellation requests', () => {
                    const testCases = [orderCancellationRequests];
                    validateAgainstSchema(testCases, orderCancellationRequestsSchema);
                });
                it('should fail for invalid order cancellation requests', () => {
                    const testCases = [
                        [
                            {
                                ...orderCancellationRequests[0],
                                takerTokenCancelAmount: undefined,
                            },
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, orderCancellationRequestsSchema, shouldFail);
                });
            });
            describe('#orderFillRequestsSchema', () => {
                const orderFillRequests = [
                    {
                        signedOrder,
                        takerTokenFillAmount: '5',
                    },
                ];
                it('should validate valid order fill requests', () => {
                    const testCases = [orderFillRequests];
                    validateAgainstSchema(testCases, orderFillRequestsSchema);
                });
                it('should fail for invalid order fill requests', () => {
                    const testCases = [
                        [
                            {
                                ...orderFillRequests[0],
                                takerTokenFillAmount: undefined,
                            },
                        ],
                    ];
                    const shouldFail = true;
                    validateAgainstSchema(testCases, orderFillRequestsSchema, shouldFail);
                });
            });
        });
    });
    describe('BigNumber serialization', () => {
        it('should correctly serialize BigNumbers', () => {
            const testCases = {
                '42': '42',
                '0': '0',
                '1.3': '1.3',
                '0.2': '0.2',
                '00.00': '0',
                '.3': '0.3',
            };
            forEach(testCases, (serialized: string, input: string) => {
                expect(JSON.parse(JSON.stringify(new BigNumber(input)))).to.be.equal(serialized);
            });
        });
    });
    describe('#jsNumberSchema', () => {
        it('should validate valid js number', () => {
            // tslint:disable-next-line:custom-no-magic-numbers
            const testCases = [1, 42];
            validateAgainstSchema(testCases, jsNumber);
        });
        it('should fail for invalid js number', () => {
            // tslint:disable-next-line:custom-no-magic-numbers
            const testCases = [NaN, -1, new BigNumber(1)];
            const shouldFail = true;
            validateAgainstSchema(testCases, jsNumber, shouldFail);
        });
    });
    describe('#txDataSchema', () => {
        it('should validate valid txData', () => {
            const bigNumGasAmount = new BigNumber(42);
            const testCases = [
                {
                    from: NULL_ADDRESS,
                },
                {
                    from: NULL_ADDRESS,
                    gas: bigNumGasAmount,
                },
                {
                    from: NULL_ADDRESS,
                    gas: 42,
                },
            ];
            validateAgainstSchema(testCases, txDataSchema);
        });
        it('should fail for invalid txData', () => {
            const testCases = [
                {
                    gas: new BigNumber(42),
                },
                {},
                [],
                new BigNumber(1),
            ];
            const shouldFail = true;
            validateAgainstSchema(testCases, txDataSchema, shouldFail);
        });
    });
}); // tslint:disable:max-file-line-count
