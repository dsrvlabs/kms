"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYSTORE = void 0;
var tx_1 = require("@ethereumjs/tx");
var ethereumjs_util_1 = require("ethereumjs-util");
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getAccount = function (node) {
        return {
            publicKey: "0x" + node.publicKey.toString("hex"),
            address: "0x" + ethereumjs_util_1.publicToAddress(node.publicKey, true).toString("hex"),
        };
    };
    KEYSTORE.legacySignTx = function (privateKey, rawTx) {
        var tx = tx_1.Transaction.fromTxData({
            nonce: ethereumjs_util_1.bnToHex(rawTx.nonce),
            gasPrice: ethereumjs_util_1.bnToHex(rawTx.gasPrice),
            gasLimit: ethereumjs_util_1.bnToHex(rawTx.gasLimit),
            to: rawTx.to,
            value: rawTx.value ? ethereumjs_util_1.bnToHex(rawTx.value) : "0x",
            data: rawTx.data ? ethereumjs_util_1.bnToHex(rawTx.data) : "0x",
        });
        var signedTx = tx.sign(privateKey);
        var json = signedTx.toJSON();
        return {
            rawTx: rawTx,
            signedTx: {
                json: __assign(__assign({}, json), { v: parseInt(json.v || "0x0", 16) }),
                signature: signedTx.serialize().toString("hex"),
            },
        };
    };
    KEYSTORE.celoSignTx = function (privateKey, rawTx) {
        var rlpEncode = ethereumjs_util_1.rlp.encode([
            ethereumjs_util_1.bnToHex(rawTx.nonce),
            ethereumjs_util_1.bnToHex(rawTx.gasPrice),
            ethereumjs_util_1.bnToHex(rawTx.gasLimit),
            rawTx.feeCurrency ? ethereumjs_util_1.bnToHex(rawTx.feeCurrency) : "0x",
            rawTx.gatewayFeeRecipient ? ethereumjs_util_1.bnToHex(rawTx.gatewayFeeRecipient) : "0x",
            rawTx.gatewayFee ? ethereumjs_util_1.bnToHex(rawTx.gatewayFee) : "0x",
            rawTx.to,
            rawTx.value ? ethereumjs_util_1.bnToHex(rawTx.value) : "0x",
            rawTx.data ? ethereumjs_util_1.bnToHex(rawTx.data) : "0x",
            ethereumjs_util_1.bnToHex(rawTx.chainId),
            "0x",
            "0x",
        ]);
        var rlpDecode = ethereumjs_util_1.rlp.decode(rlpEncode);
        var signature = ethereumjs_util_1.ecsign(ethereumjs_util_1.keccak256(rlpEncode), privateKey, rawTx.chainId);
        return {
            rawTx: rawTx,
            signedTx: {
                json: {
                    nonce: "0x" + rlpDecode[0].toString("hex"),
                    gasPrice: "0x" + rlpDecode[1].toString("hex"),
                    gasLimit: "0x" + rlpDecode[2].toString("hex"),
                    feeCurrency: "0x" + rlpDecode[3].toString("hex"),
                    gatewayFeeRecipient: "0x" + rlpDecode[4].toString("hex"),
                    gatewayFee: "0x" + rlpDecode[5].toString("hex"),
                    to: "0x" + rlpDecode[6].toString("hex"),
                    value: "0x" + rlpDecode[7].toString("hex"),
                    data: "0x" + rlpDecode[8].toString("hex"),
                    chainId: "0x" + rlpDecode[9].toString("hex"),
                    v: signature.v,
                    r: "0x" + signature.r.toString("hex"),
                    s: "0x" + signature.s.toString("hex"),
                },
            },
        };
    };
    KEYSTORE.klaySignTx = function (privateKey, rawTx) {
        return KEYSTORE.legacySignTx(privateKey, rawTx);
    };
    KEYSTORE.signTx = function (node, rawTx) {
        if (node.privateKey) {
            switch (rawTx.chainId) {
                case 1: // main
                case 3: // ropsten
                case 4: // rinkeby
                case 5: {
                    var tx = tx_1.FeeMarketEIP1559Transaction.fromTxData({
                        nonce: rawTx.nonce,
                        gasLimit: rawTx.gasPrice,
                        to: rawTx.to,
                        value: rawTx.value,
                        data: rawTx.data,
                        chainId: rawTx.chainId,
                        accessList: rawTx.accessList,
                        maxPriorityFeePerGas: rawTx.maxPriorityFeePerGas,
                        maxFeePerGas: rawTx.maxFeePerGas,
                    });
                    var signedTx = tx.sign(node.privateKey);
                    var json = signedTx.toJSON();
                    return {
                        rawTx: rawTx,
                        signedTx: {
                            json: __assign(__assign({}, json), { v: parseInt(json.v || "0x0", 16) }),
                            signature: signedTx.serialize().toString("hex"),
                        },
                    };
                }
                case 1001: // klaytn testnet
                case 8217: // klaytn mainnet
                    return KEYSTORE.klaySignTx(node.privateKey, rawTx);
                case 42220: // celo mainnet
                case 44787: // celo Alfajores
                case 62320: // celo Baklava
                    return KEYSTORE.celoSignTx(node.privateKey, rawTx);
                case 9000: // evmos testnet
                case 1313161554: // aurora mainnet
                case 1313161555: // aurora testnet
                case 1313161556: // aurora betanet
                default:
                    return KEYSTORE.legacySignTx(node.privateKey, rawTx);
            }
        }
        return {
            rawTx: rawTx,
        };
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map