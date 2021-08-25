"use strict";
// tslint:disable:max-file-line-count
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTransferResults = exports.OrderStatus = exports.TypeDocTypes = exports.WebsocketClientEventType = exports.WebsocketConnectionEventType = exports.OrdersChannelMessageTypes = exports.StatusCodes = exports.RevertReason = exports.AssetProxyId = exports.SignatureType = exports.ExchangeContractErrs = exports.MarketOperation = void 0;
var MarketOperation;
(function (MarketOperation) {
    MarketOperation["Sell"] = "Sell";
    MarketOperation["Buy"] = "Buy";
})(MarketOperation = exports.MarketOperation || (exports.MarketOperation = {}));
/**
 * Errors originating from the 0x exchange contract
 */
var ExchangeContractErrs;
(function (ExchangeContractErrs) {
    ExchangeContractErrs["OrderFillExpired"] = "ORDER_FILL_EXPIRED";
    ExchangeContractErrs["OrderCancelExpired"] = "ORDER_CANCEL_EXPIRED";
    ExchangeContractErrs["OrderCancelled"] = "ORDER_CANCELLED";
    ExchangeContractErrs["OrderFillAmountZero"] = "ORDER_FILL_AMOUNT_ZERO";
    ExchangeContractErrs["OrderRemainingFillAmountZero"] = "ORDER_REMAINING_FILL_AMOUNT_ZERO";
    ExchangeContractErrs["OrderFillRoundingError"] = "ORDER_FILL_ROUNDING_ERROR";
    ExchangeContractErrs["FillBalanceAllowanceError"] = "FILL_BALANCE_ALLOWANCE_ERROR";
    ExchangeContractErrs["InsufficientTakerBalance"] = "INSUFFICIENT_TAKER_BALANCE";
    ExchangeContractErrs["InsufficientTakerAllowance"] = "INSUFFICIENT_TAKER_ALLOWANCE";
    ExchangeContractErrs["InsufficientMakerBalance"] = "INSUFFICIENT_MAKER_BALANCE";
    ExchangeContractErrs["InsufficientMakerAllowance"] = "INSUFFICIENT_MAKER_ALLOWANCE";
    ExchangeContractErrs["InsufficientTakerFeeBalance"] = "INSUFFICIENT_TAKER_FEE_BALANCE";
    ExchangeContractErrs["InsufficientTakerFeeAllowance"] = "INSUFFICIENT_TAKER_FEE_ALLOWANCE";
    ExchangeContractErrs["InsufficientMakerFeeBalance"] = "INSUFFICIENT_MAKER_FEE_BALANCE";
    ExchangeContractErrs["InsufficientMakerFeeAllowance"] = "INSUFFICIENT_MAKER_FEE_ALLOWANCE";
    ExchangeContractErrs["TransactionSenderIsNotFillOrderTaker"] = "TRANSACTION_SENDER_IS_NOT_FILL_ORDER_TAKER";
    ExchangeContractErrs["MultipleMakersInSingleCancelBatchDisallowed"] = "MULTIPLE_MAKERS_IN_SINGLE_CANCEL_BATCH_DISALLOWED";
    ExchangeContractErrs["InsufficientRemainingFillAmount"] = "INSUFFICIENT_REMAINING_FILL_AMOUNT";
    ExchangeContractErrs["MultipleTakerTokensInFillUpToDisallowed"] = "MULTIPLE_TAKER_TOKENS_IN_FILL_UP_TO_DISALLOWED";
    ExchangeContractErrs["BatchOrdersMustHaveSameExchangeAddress"] = "BATCH_ORDERS_MUST_HAVE_SAME_EXCHANGE_ADDRESS";
    ExchangeContractErrs["BatchOrdersMustHaveAtLeastOneItem"] = "BATCH_ORDERS_MUST_HAVE_AT_LEAST_ONE_ITEM";
})(ExchangeContractErrs = exports.ExchangeContractErrs || (exports.ExchangeContractErrs = {}));
var SignatureType;
(function (SignatureType) {
    SignatureType[SignatureType["Illegal"] = 0] = "Illegal";
    SignatureType[SignatureType["Invalid"] = 1] = "Invalid";
    SignatureType[SignatureType["EIP712"] = 2] = "EIP712";
    SignatureType[SignatureType["EthSign"] = 3] = "EthSign";
    SignatureType[SignatureType["Wallet"] = 4] = "Wallet";
    SignatureType[SignatureType["Validator"] = 5] = "Validator";
    SignatureType[SignatureType["PreSigned"] = 6] = "PreSigned";
    SignatureType[SignatureType["EIP1271Wallet"] = 7] = "EIP1271Wallet";
    SignatureType[SignatureType["NSignatureTypes"] = 8] = "NSignatureTypes";
})(SignatureType = exports.SignatureType || (exports.SignatureType = {}));
var AssetProxyId;
(function (AssetProxyId) {
    AssetProxyId["ERC20"] = "0xf47261b0";
    AssetProxyId["ERC721"] = "0x02571792";
    AssetProxyId["MultiAsset"] = "0x94cfcdd7";
    AssetProxyId["ERC1155"] = "0xa7cb5fb7";
    AssetProxyId["StaticCall"] = "0xc339d10a";
    AssetProxyId["ERC20Bridge"] = "0xdc1600f3";
})(AssetProxyId = exports.AssetProxyId || (exports.AssetProxyId = {}));
// TODO: DRY. These should be extracted from contract code.
var RevertReason;
(function (RevertReason) {
    RevertReason["OrderUnfillable"] = "ORDER_UNFILLABLE";
    RevertReason["InvalidMaker"] = "INVALID_MAKER";
    RevertReason["InvalidTaker"] = "INVALID_TAKER";
    RevertReason["InvalidSender"] = "INVALID_SENDER";
    RevertReason["InvalidOrderSignature"] = "INVALID_ORDER_SIGNATURE";
    RevertReason["InvalidTakerAmount"] = "INVALID_TAKER_AMOUNT";
    RevertReason["DivisionByZero"] = "DIVISION_BY_ZERO";
    RevertReason["RoundingError"] = "ROUNDING_ERROR";
    RevertReason["InvalidSignature"] = "INVALID_SIGNATURE";
    RevertReason["SignatureIllegal"] = "SIGNATURE_ILLEGAL";
    RevertReason["SignatureInvalid"] = "SIGNATURE_INVALID";
    RevertReason["SignatureUnsupported"] = "SIGNATURE_UNSUPPORTED";
    RevertReason["TakerOverpay"] = "TAKER_OVERPAY";
    RevertReason["OrderOverfill"] = "ORDER_OVERFILL";
    RevertReason["InvalidFillPrice"] = "INVALID_FILL_PRICE";
    RevertReason["InvalidNewOrderEpoch"] = "INVALID_NEW_ORDER_EPOCH";
    RevertReason["CompleteFillFailed"] = "COMPLETE_FILL_FAILED";
    RevertReason["NegativeSpreadRequired"] = "NEGATIVE_SPREAD_REQUIRED";
    RevertReason["ReentrancyIllegal"] = "REENTRANCY_ILLEGAL";
    RevertReason["InvalidTxHash"] = "INVALID_TX_HASH";
    RevertReason["InvalidTxSignature"] = "INVALID_TX_SIGNATURE";
    RevertReason["FailedExecution"] = "FAILED_EXECUTION";
    RevertReason["AssetProxyAlreadyExists"] = "ASSET_PROXY_ALREADY_EXISTS";
    RevertReason["LengthGreaterThan0Required"] = "LENGTH_GREATER_THAN_0_REQUIRED";
    RevertReason["LengthGreaterThan3Required"] = "LENGTH_GREATER_THAN_3_REQUIRED";
    RevertReason["LengthGreaterThan131Required"] = "LENGTH_GREATER_THAN_131_REQUIRED";
    RevertReason["Length0Required"] = "LENGTH_0_REQUIRED";
    RevertReason["Length65Required"] = "LENGTH_65_REQUIRED";
    RevertReason["InvalidAmount"] = "INVALID_AMOUNT";
    RevertReason["TransferFailed"] = "TRANSFER_FAILED";
    RevertReason["SenderNotAuthorized"] = "SENDER_NOT_AUTHORIZED";
    RevertReason["TargetNotAuthorized"] = "TARGET_NOT_AUTHORIZED";
    RevertReason["TargetAlreadyAuthorized"] = "TARGET_ALREADY_AUTHORIZED";
    RevertReason["IndexOutOfBounds"] = "INDEX_OUT_OF_BOUNDS";
    RevertReason["AuthorizedAddressMismatch"] = "AUTHORIZED_ADDRESS_MISMATCH";
    RevertReason["OnlyContractOwner"] = "ONLY_CONTRACT_OWNER";
    RevertReason["MakerNotWhitelisted"] = "MAKER_NOT_WHITELISTED";
    RevertReason["TakerNotWhitelisted"] = "TAKER_NOT_WHITELISTED";
    RevertReason["AssetProxyDoesNotExist"] = "ASSET_PROXY_DOES_NOT_EXIST";
    RevertReason["LengthMismatch"] = "LENGTH_MISMATCH";
    RevertReason["LibBytesGreaterThanZeroLengthRequired"] = "GREATER_THAN_ZERO_LENGTH_REQUIRED";
    RevertReason["LibBytesGreaterOrEqualTo4LengthRequired"] = "GREATER_OR_EQUAL_TO_4_LENGTH_REQUIRED";
    RevertReason["LibBytesGreaterOrEqualTo20LengthRequired"] = "GREATER_OR_EQUAL_TO_20_LENGTH_REQUIRED";
    RevertReason["LibBytesGreaterOrEqualTo32LengthRequired"] = "GREATER_OR_EQUAL_TO_32_LENGTH_REQUIRED";
    RevertReason["LibBytesGreaterOrEqualToNestedBytesLengthRequired"] = "GREATER_OR_EQUAL_TO_NESTED_BYTES_LENGTH_REQUIRED";
    RevertReason["LibBytesGreaterOrEqualToSourceBytesLengthRequired"] = "GREATER_OR_EQUAL_TO_SOURCE_BYTES_LENGTH_REQUIRED";
    RevertReason["Erc20InsufficientBalance"] = "ERC20_INSUFFICIENT_BALANCE";
    RevertReason["Erc20InsufficientAllowance"] = "ERC20_INSUFFICIENT_ALLOWANCE";
    RevertReason["FeePercentageTooLarge"] = "FEE_PERCENTAGE_TOO_LARGE";
    RevertReason["ValueGreaterThanZero"] = "VALUE_GREATER_THAN_ZERO";
    RevertReason["InvalidMsgValue"] = "INVALID_MSG_VALUE";
    RevertReason["InsufficientEthRemaining"] = "INSUFFICIENT_ETH_REMAINING";
    RevertReason["Uint256Overflow"] = "UINT256_OVERFLOW";
    RevertReason["Erc721ZeroToAddress"] = "ERC721_ZERO_TO_ADDRESS";
    RevertReason["Erc721OwnerMismatch"] = "ERC721_OWNER_MISMATCH";
    RevertReason["Erc721InvalidSpender"] = "ERC721_INVALID_SPENDER";
    RevertReason["Erc721ZeroOwner"] = "ERC721_ZERO_OWNER";
    RevertReason["Erc721InvalidSelector"] = "ERC721_INVALID_SELECTOR";
    RevertReason["WalletError"] = "WALLET_ERROR";
    RevertReason["ValidatorError"] = "VALIDATOR_ERROR";
    RevertReason["InvalidFunctionSelector"] = "INVALID_FUNCTION_SELECTOR";
    RevertReason["InvalidAssetData"] = "INVALID_ASSET_DATA";
    RevertReason["InvalidAssetProxy"] = "INVALID_ASSET_PROXY";
    RevertReason["UnregisteredAssetProxy"] = "UNREGISTERED_ASSET_PROXY";
    RevertReason["TxFullyConfirmed"] = "TX_FULLY_CONFIRMED";
    RevertReason["TxNotFullyConfirmed"] = "TX_NOT_FULLY_CONFIRMED";
    RevertReason["TimeLockIncomplete"] = "TIME_LOCK_INCOMPLETE";
    // LibAddressArray
    RevertReason["InvalidFreeMemoryPtr"] = "INVALID_FREE_MEMORY_PTR";
    // DutchAuction
    RevertReason["AuctionInvalidAmount"] = "INVALID_AMOUNT";
    RevertReason["AuctionExpired"] = "AUCTION_EXPIRED";
    RevertReason["AuctionNotStarted"] = "AUCTION_NOT_STARTED";
    RevertReason["AuctionInvalidBeginTime"] = "INVALID_BEGIN_TIME";
    RevertReason["InvalidAssetDataEnd"] = "INVALID_ASSET_DATA_END";
    // Balance Threshold Filter
    RevertReason["InvalidOrBlockedExchangeSelector"] = "INVALID_OR_BLOCKED_EXCHANGE_SELECTOR";
    RevertReason["BalanceQueryFailed"] = "BALANCE_QUERY_FAILED";
    RevertReason["AtLeastOneAddressDoesNotMeetBalanceThreshold"] = "AT_LEAST_ONE_ADDRESS_DOES_NOT_MEET_BALANCE_THRESHOLD";
    RevertReason["FromLessThanToRequired"] = "FROM_LESS_THAN_TO_REQUIRED";
    RevertReason["ToLessThanLengthRequired"] = "TO_LESS_THAN_LENGTH_REQUIRED";
    RevertReason["InvalidApprovalSignature"] = "INVALID_APPROVAL_SIGNATURE";
    RevertReason["ApprovalExpired"] = "APPROVAL_EXPIRED";
    RevertReason["InvalidOrigin"] = "INVALID_ORIGIN";
    // ERC1155
    RevertReason["AmountEqualToOneRequired"] = "AMOUNT_EQUAL_TO_ONE_REQUIRED";
    RevertReason["BadReceiverReturnValue"] = "BAD_RECEIVER_RETURN_VALUE";
    RevertReason["CannotTransferToAddressZero"] = "CANNOT_TRANSFER_TO_ADDRESS_ZERO";
    RevertReason["InsufficientAllowance"] = "INSUFFICIENT_ALLOWANCE";
    RevertReason["NFTNotOwnedByFromAddress"] = "NFT_NOT_OWNED_BY_FROM_ADDRESS";
    RevertReason["OwnersAndIdsMustHaveSameLength"] = "OWNERS_AND_IDS_MUST_HAVE_SAME_LENGTH";
    RevertReason["TokenAndValuesLengthMismatch"] = "TOKEN_AND_VALUES_LENGTH_MISMATCH";
    RevertReason["TriedToMintFungibleForNonFungibleToken"] = "TRIED_TO_MINT_FUNGIBLE_FOR_NON_FUNGIBLE_TOKEN";
    RevertReason["TriedToMintNonFungibleForFungibleToken"] = "TRIED_TO_MINT_NON_FUNGIBLE_FOR_FUNGIBLE_TOKEN";
    RevertReason["TransferRejected"] = "TRANSFER_REJECTED";
    RevertReason["Uint256Underflow"] = "UINT256_UNDERFLOW";
    RevertReason["InvalidIdsOffset"] = "INVALID_IDS_OFFSET";
    RevertReason["InvalidValuesOffset"] = "INVALID_VALUES_OFFSET";
    RevertReason["InvalidDataOffset"] = "INVALID_DATA_OFFSET";
    RevertReason["InvalidAssetDataLength"] = "INVALID_ASSET_DATA_LENGTH";
    // StaticCall
    RevertReason["InvalidStaticCallDataOffset"] = "INVALID_STATIC_CALL_DATA_OFFSET";
    RevertReason["TargetNotEven"] = "TARGET_NOT_EVEN";
    RevertReason["UnexpectedStaticCallResult"] = "UNEXPECTED_STATIC_CALL_RESULT";
    RevertReason["TransfersSuccessful"] = "TRANSFERS_SUCCESSFUL";
    // Staking
    RevertReason["InsufficientFunds"] = "INSUFFICIENT_FUNDS";
    // AssetProxyOwner
    RevertReason["TxAlreadyExecuted"] = "TX_ALREADY_EXECUTED";
    RevertReason["DefaultTimeLockIncomplete"] = "DEFAULT_TIME_LOCK_INCOMPLETE";
    RevertReason["CustomTimeLockIncomplete"] = "CUSTOM_TIME_LOCK_INCOMPLETE";
    RevertReason["EqualLengthsRequired"] = "EQUAL_LENGTHS_REQUIRED";
    RevertReason["OnlyCallableByWallet"] = "ONLY_CALLABLE_BY_WALLET";
    RevertReason["ChaiBridgeOnlyCallableByErc20BridgeProxy"] = "ChaiBridge/ONLY_CALLABLE_BY_ERC20_BRIDGE_PROXY";
    RevertReason["ChaiBridgeDrawDaiFailed"] = "ChaiBridge/DRAW_DAI_FAILED";
    RevertReason["DydxBridgeOnlyCallableByErc20BridgeProxy"] = "DydxBridge/ONLY_CALLABLE_BY_ERC20_BRIDGE_PROXY";
    RevertReason["DydxBridgeUnrecognizedBridgeAction"] = "DydxBridge/UNRECOGNIZED_BRIDGE_ACTION";
})(RevertReason = exports.RevertReason || (exports.RevertReason = {}));
var StatusCodes;
(function (StatusCodes) {
    StatusCodes[StatusCodes["Success"] = 200] = "Success";
    StatusCodes[StatusCodes["NotFound"] = 404] = "NotFound";
    StatusCodes[StatusCodes["InternalError"] = 500] = "InternalError";
    StatusCodes[StatusCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    StatusCodes[StatusCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(StatusCodes = exports.StatusCodes || (exports.StatusCodes = {}));
var OrdersChannelMessageTypes;
(function (OrdersChannelMessageTypes) {
    OrdersChannelMessageTypes["Update"] = "update";
    OrdersChannelMessageTypes["Unknown"] = "unknown";
})(OrdersChannelMessageTypes = exports.OrdersChannelMessageTypes || (exports.OrdersChannelMessageTypes = {}));
var WebsocketConnectionEventType;
(function (WebsocketConnectionEventType) {
    WebsocketConnectionEventType["Close"] = "close";
    WebsocketConnectionEventType["Error"] = "error";
    WebsocketConnectionEventType["Message"] = "message";
})(WebsocketConnectionEventType = exports.WebsocketConnectionEventType || (exports.WebsocketConnectionEventType = {}));
var WebsocketClientEventType;
(function (WebsocketClientEventType) {
    WebsocketClientEventType["Connect"] = "connect";
    WebsocketClientEventType["ConnectFailed"] = "connectFailed";
})(WebsocketClientEventType = exports.WebsocketClientEventType || (exports.WebsocketClientEventType = {}));
var TypeDocTypes;
(function (TypeDocTypes) {
    TypeDocTypes["Intrinsic"] = "intrinsic";
    TypeDocTypes["Reference"] = "reference";
    TypeDocTypes["Array"] = "array";
    TypeDocTypes["StringLiteral"] = "stringLiteral";
    TypeDocTypes["Reflection"] = "reflection";
    TypeDocTypes["Union"] = "union";
    TypeDocTypes["TypeParameter"] = "typeParameter";
    TypeDocTypes["Intersection"] = "intersection";
    TypeDocTypes["Tuple"] = "tuple";
    TypeDocTypes["Unknown"] = "unknown";
})(TypeDocTypes = exports.TypeDocTypes || (exports.TypeDocTypes = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Invalid"] = 0] = "Invalid";
    OrderStatus[OrderStatus["InvalidMakerAssetAmount"] = 1] = "InvalidMakerAssetAmount";
    OrderStatus[OrderStatus["InvalidTakerAssetAmount"] = 2] = "InvalidTakerAssetAmount";
    OrderStatus[OrderStatus["Fillable"] = 3] = "Fillable";
    OrderStatus[OrderStatus["Expired"] = 4] = "Expired";
    OrderStatus[OrderStatus["FullyFilled"] = 5] = "FullyFilled";
    OrderStatus[OrderStatus["Cancelled"] = 6] = "Cancelled";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var OrderTransferResults;
(function (OrderTransferResults) {
    OrderTransferResults[OrderTransferResults["TakerAssetDataFailed"] = 0] = "TakerAssetDataFailed";
    OrderTransferResults[OrderTransferResults["MakerAssetDataFailed"] = 1] = "MakerAssetDataFailed";
    OrderTransferResults[OrderTransferResults["TakerFeeAssetDataFailed"] = 2] = "TakerFeeAssetDataFailed";
    OrderTransferResults[OrderTransferResults["MakerFeeAssetDataFailed"] = 3] = "MakerFeeAssetDataFailed";
    OrderTransferResults[OrderTransferResults["TransfersSuccessful"] = 4] = "TransfersSuccessful";
})(OrderTransferResults = exports.OrderTransferResults || (exports.OrderTransferResults = {}));
//# sourceMappingURL=index.js.map