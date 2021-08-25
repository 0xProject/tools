export declare const schemas: {
    numberSchema: {
        id: string;
        type: string;
        pattern: string;
    };
    addressSchema: {
        id: string;
        type: string;
        pattern: string;
    };
    callDataSchema: {
        id: string;
        properties: {
            from: {
                $ref: string;
            };
            to: {
                $ref: string;
            };
            value: {
                oneOf: {
                    $ref: string;
                }[];
            };
            gas: {
                oneOf: {
                    $ref: string;
                }[];
            };
            gasPrice: {
                oneOf: {
                    $ref: string;
                }[];
            };
            data: {
                type: string;
                pattern: string;
            };
            nonce: {
                type: string;
                minimum: number;
            };
            overrides: {
                type: string;
                additionalProperties: {
                    type: string;
                    properties: {
                        code: {
                            type: string;
                            pattern: string;
                        };
                        nonce: {
                            oneOf: {
                                $ref: string;
                            }[];
                        };
                        balance: {
                            oneOf: {
                                $ref: string;
                            }[];
                        };
                    };
                };
            };
            accessList: {
                type: string;
                additionalProperties: {
                    type: string;
                    items: {
                        type: string;
                        pattern: string;
                    };
                };
            };
        };
        required: never[];
        type: string;
        additionalProperties: boolean;
    };
    hexSchema: {
        id: string;
        type: string;
        pattern: string;
    };
    ecSignatureParameterSchema: {
        id: string;
        type: string;
        pattern: string;
    };
    ecSignatureSchema: {
        id: string;
        properties: {
            v: {
                type: string;
                minimum: number;
                maximum: number;
            };
            r: {
                $ref: string;
            };
            s: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    eip712DomainSchema: {
        id: string;
        properties: {
            name: {
                type: string;
            };
            version: {
                type: string;
            };
            chainId: {
                type: string;
            };
            verifyingContract: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    eip712TypedDataSchema: {
        id: string;
        type: string;
        properties: {
            types: {
                type: string;
                properties: {
                    EIP712Domain: {
                        type: string;
                    };
                };
                additionalProperties: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            name: {
                                type: string;
                            };
                            type: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
            };
            primaryType: {
                type: string;
            };
            domain: {
                $ref: string;
            };
            message: {
                type: string;
            };
        };
        required: string[];
    };
    indexFilterValuesSchema: {
        id: string;
        additionalProperties: {
            oneOf: {
                $ref: string;
            }[];
        };
        type: string;
    };
    orderCancellationRequestsSchema: {
        id: string;
        type: string;
        items: {
            properties: {
                order: {
                    $ref: string;
                };
                takerTokenCancelAmount: {
                    $ref: string;
                };
            };
            required: string[];
            type: string;
        };
    };
    orderFillOrKillRequestsSchema: {
        id: string;
        type: string;
        items: {
            properties: {
                signedOrder: {
                    $ref: string;
                };
                fillTakerAmount: {
                    $ref: string;
                };
            };
            required: string[];
            type: string;
        };
    };
    orderFillRequestsSchema: {
        id: string;
        type: string;
        items: {
            properties: {
                signedOrder: {
                    $ref: string;
                };
                takerTokenFillAmount: {
                    $ref: string;
                };
            };
            required: string[];
            type: string;
        };
    };
    orderHashSchema: {
        id: string;
        type: string;
        pattern: string;
    };
    orderSchema: {
        id: string;
        properties: {
            makerAddress: {
                $ref: string;
            };
            takerAddress: {
                $ref: string;
            };
            makerFee: {
                $ref: string;
            };
            takerFee: {
                $ref: string;
            };
            senderAddress: {
                $ref: string;
            };
            makerAssetAmount: {
                $ref: string;
            };
            takerAssetAmount: {
                $ref: string;
            };
            makerAssetData: {
                $ref: string;
            };
            takerAssetData: {
                $ref: string;
            };
            makerFeeAssetData: {
                $ref: string;
            };
            takerFeeAssetData: {
                $ref: string;
            };
            salt: {
                $ref: string;
            };
            feeRecipientAddress: {
                $ref: string;
            };
            expirationTimeSeconds: {
                $ref: string;
            };
            chainId: {
                type: string;
            };
            exchangeAddress: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    signedOrderSchema: {
        id: string;
        allOf: ({
            $ref: string;
            properties?: undefined;
            required?: undefined;
        } | {
            properties: {
                signature: {
                    $ref: string;
                };
            };
            required: string[];
            $ref?: undefined;
        })[];
    };
    signedOrdersSchema: {
        id: string;
        type: string;
        items: {
            $ref: string;
        };
    };
    ordersSchema: {
        id: string;
        type: string;
        items: {
            $ref: string;
        };
    };
    blockParamSchema: {
        id: string;
        oneOf: ({
            type: string;
            enum?: undefined;
        } | {
            enum: string[];
            type?: undefined;
        })[];
    };
    blockRangeSchema: {
        id: string;
        properties: {
            fromBlock: {
                $ref: string;
            };
            toBlock: {
                $ref: string;
            };
        };
        type: string;
    };
    tokenSchema: {
        id: string;
        properties: {
            name: {
                type: string;
            };
            symbol: {
                type: string;
            };
            decimals: {
                type: string;
            };
            address: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    jsNumber: {
        id: string;
        type: string;
        minimum: number;
    };
    pagedRequestOptsSchema: {
        id: string;
        type: string;
        properties: {
            page: {
                type: string;
            };
            perPage: {
                type: string;
            };
        };
    };
    ordersRequestOptsSchema: {
        id: string;
        type: string;
        properties: {
            makerAssetProxyId: {
                $ref: string;
            };
            takerAssetProxyId: {
                $ref: string;
            };
            makerAssetAddress: {
                $ref: string;
            };
            takerAssetAddress: {
                $ref: string;
            };
            exchangeAddress: {
                $ref: string;
            };
            senderAddress: {
                $ref: string;
            };
            makerAssetData: {
                $ref: string;
            };
            takerAssetData: {
                $ref: string;
            };
            traderAssetData: {
                $ref: string;
            };
            makerFeeAssetData: {
                $ref: string;
            };
            takerFeeAssetData: {
                $ref: string;
            };
            makerAddress: {
                $ref: string;
            };
            takerAddress: {
                $ref: string;
            };
            traderAddress: {
                $ref: string;
            };
            feeRecipientAddress: {
                $ref: string;
            };
            unfillable: {
                type: string;
            };
        };
    };
    orderBookRequestSchema: {
        id: string;
        type: string;
        properties: {
            baseAssetData: {
                $ref: string;
            };
            quoteAssetData: {
                $ref: string;
            };
        };
        required: string[];
    };
    orderConfigRequestSchema: {
        id: string;
        type: string;
        properties: {
            makerAddress: {
                $ref: string;
            };
            takerAddress: {
                $ref: string;
            };
            makerAssetAmount: {
                $ref: string;
            };
            takerAssetAmount: {
                $ref: string;
            };
            makerAssetData: {
                $ref: string;
            };
            takerAssetData: {
                $ref: string;
            };
            exchangeAddress: {
                $ref: string;
            };
            expirationTimeSeconds: {
                $ref: string;
            };
        };
        required: string[];
    };
    assetPairsRequestOptsSchema: {
        id: string;
        type: string;
        properties: {
            assetDataA: {
                $ref: string;
            };
            assetDataB: {
                $ref: string;
            };
        };
    };
    txDataSchema: {
        id: string;
        properties: {
            from: {
                $ref: string;
            };
            to: {
                $ref: string;
            };
            value: {
                oneOf: {
                    $ref: string;
                }[];
            };
            gas: {
                oneOf: {
                    $ref: string;
                }[];
            };
            gasPrice: {
                oneOf: {
                    $ref: string;
                }[];
            };
            data: {
                type: string;
                pattern: string;
            };
            nonce: {
                type: string;
                minimum: number;
            };
            accessList: {
                type: string;
                additionalProperties: {
                    type: string;
                    items: {
                        type: string;
                        pattern: string;
                    };
                };
            };
        };
        required: string[];
        type: string;
    };
    paginatedCollectionSchema: {
        id: string;
        type: string;
        properties: {
            total: {
                type: string;
            };
            perPage: {
                type: string;
            };
            page: {
                type: string;
            };
        };
        required: string[];
    };
    zeroExTransactionSchema: {
        id: string;
        properties: {
            data: {
                $ref: string;
            };
            signerAddress: {
                $ref: string;
            };
            salt: {
                $ref: string;
            };
            expirationTimeSeconds: {
                $ref: string;
            };
            gasPrice: {
                $ref: string;
            };
            domain: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    exchangeProxyMetaTransactionSchema: {
        id: string;
        properties: {
            signer: {
                $ref: string;
            };
            sender: {
                $ref: string;
            };
            minGasPrice: {
                $ref: string;
            };
            maxGasPrice: {
                $ref: string;
            };
            expirationTimeSeconds: {
                $ref: string;
            };
            salt: {
                $ref: string;
            };
            callData: {
                $ref: string;
            };
            value: {
                $ref: string;
            };
            feeToken: {
                $ref: string;
            };
            feeAmount: {
                $ref: string;
            };
            domain: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    wholeNumberSchema: {
        id: string;
        anyOf: ({
            type: string;
            pattern: string;
        } | {
            type: string;
            pattern?: undefined;
        })[];
    };
    v4SignatureSchema: {
        id: string;
        properties: {
            signatureType: {
                enum: number[];
            };
            v: {
                enum: number[];
            };
            r: {
                $ref: string;
            };
            s: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    v4RfqOrderSchema: {
        id: string;
        properties: {
            maker: {
                $ref: string;
            };
            taker: {
                $ref: string;
            };
            txOrigin: {
                $ref: string;
            };
            makerAmount: {
                $ref: string;
            };
            takerAmount: {
                $ref: string;
            };
            makerToken: {
                $ref: string;
            };
            takerToken: {
                $ref: string;
            };
            salt: {
                $ref: string;
            };
            expiry: {
                $ref: string;
            };
            chainId: {
                type: string;
            };
            verifyingContract: {
                $ref: string;
            };
            pool: {
                $ref: string;
            };
        };
        required: string[];
        type: string;
    };
    v4RfqSignedOrderSchema: {
        id: string;
        allOf: ({
            $ref: string;
            properties?: undefined;
            required?: undefined;
        } | {
            properties: {
                signature: {
                    $ref: string;
                };
            };
            required: string[];
            $ref?: undefined;
        })[];
    };
};
//# sourceMappingURL=schemas.d.ts.map