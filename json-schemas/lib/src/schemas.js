"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = void 0;
const addressSchema = require("../schemas/address_schema.json");
const assetPairsRequestOptsSchema = require("../schemas/asset_pairs_request_opts_schema.json");
const blockParamSchema = require("../schemas/block_param_schema.json");
const blockRangeSchema = require("../schemas/block_range_schema.json");
const callDataSchema = require("../schemas/call_data_schema.json");
const ecSignatureParameterSchema = require("../schemas/ec_signature_parameter_schema.json");
const ecSignatureSchema = require("../schemas/ec_signature_schema.json");
const eip712DomainSchema = require("../schemas/eip712_domain_schema.json");
const eip712TypedDataSchema = require("../schemas/eip712_typed_data_schema.json");
const exchangeProxyMetaTransactionSchema = require("../schemas/exchange_proxy_meta_transaction_schema.json");
const hexSchema = require("../schemas/hex_schema.json");
const indexFilterValuesSchema = require("../schemas/index_filter_values_schema.json");
const jsNumber = require("../schemas/js_number_schema.json");
const numberSchema = require("../schemas/number_schema.json");
const orderCancellationRequestsSchema = require("../schemas/order_cancel_schema.json");
const orderConfigRequestSchema = require("../schemas/order_config_request_schema.json");
const orderFillOrKillRequestsSchema = require("../schemas/order_fill_or_kill_requests_schema.json");
const orderFillRequestsSchema = require("../schemas/order_fill_requests_schema.json");
const orderHashSchema = require("../schemas/order_hash_schema.json");
const orderSchema = require("../schemas/order_schema.json");
const orderBookRequestSchema = require("../schemas/orderbook_request_schema.json");
const ordersRequestOptsSchema = require("../schemas/orders_request_opts_schema.json");
const ordersSchema = require("../schemas/orders_schema.json");
const pagedRequestOptsSchema = require("../schemas/paged_request_opts_schema.json");
const paginatedCollectionSchema = require("../schemas/paginated_collection_schema.json");
const signedOrderSchema = require("../schemas/signed_order_schema.json");
const signedOrdersSchema = require("../schemas/signed_orders_schema.json");
const tokenSchema = require("../schemas/token_schema.json");
const txDataSchema = require("../schemas/tx_data_schema.json");
const v4RfqOrderSchema = require("../schemas/v4_rfq_order_schema.json");
const v4RfqSignedOrderSchema = require("../schemas/v4_rfq_signed_order_schema.json");
const v4SignatureSchema = require("../schemas/v4_signature_schema.json");
const wholeNumberSchema = require("../schemas/whole_number_schema.json");
const zeroExTransactionSchema = require("../schemas/zero_ex_transaction_schema.json");
exports.schemas = {
    numberSchema,
    addressSchema,
    callDataSchema,
    hexSchema,
    ecSignatureParameterSchema,
    ecSignatureSchema,
    eip712DomainSchema,
    eip712TypedDataSchema,
    indexFilterValuesSchema,
    orderCancellationRequestsSchema,
    orderFillOrKillRequestsSchema,
    orderFillRequestsSchema,
    orderHashSchema,
    orderSchema,
    signedOrderSchema,
    signedOrdersSchema,
    ordersSchema,
    blockParamSchema,
    blockRangeSchema,
    tokenSchema,
    jsNumber,
    pagedRequestOptsSchema,
    ordersRequestOptsSchema,
    orderBookRequestSchema,
    orderConfigRequestSchema,
    assetPairsRequestOptsSchema,
    txDataSchema,
    paginatedCollectionSchema,
    zeroExTransactionSchema,
    exchangeProxyMetaTransactionSchema,
    wholeNumberSchema,
    v4SignatureSchema,
    v4RfqOrderSchema,
    v4RfqSignedOrderSchema,
};
//# sourceMappingURL=schemas.js.map