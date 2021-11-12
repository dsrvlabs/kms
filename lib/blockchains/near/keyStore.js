"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYSTORE = void 0;
var bs58_1 = require("bs58");
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var near_hd_key_1 = require("near-hd-key");
var js_sha256_1 = __importDefault(require("js-sha256"));
var near_api_js_1 = require("near-api-js");
var createTransaction_1 = require("./createTransaction");
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getPrivateKey = function (seed, path) {
        var key = near_hd_key_1.derivePath("m/44'/" + path.type + "'/" + path.account + "'/0'/" + path.index + "'", seed.toString("hex")).key;
        var keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(key);
        return "" + bs58_1.encode(Buffer.from(keyPair.secretKey));
    };
    // eslint-disable-next-line camelcase
    KEYSTORE.getKeyPair = function (seed, path) {
        var privateKey = KEYSTORE.getPrivateKey(seed, path);
        var keyPair = near_api_js_1.utils.key_pair.KeyPairEd25519.fromString(privateKey);
        return keyPair;
    };
    KEYSTORE.getAccount = function (seed, path) {
        var keyPair = KEYSTORE.getKeyPair(seed, path);
        return {
            address: keyPair.getPublicKey().toString(),
            publicKey: keyPair.getPublicKey().toString(),
        };
    };
    KEYSTORE.signTx = function (seed, path, rawTx) {
        var transaction = createTransaction_1.createTransaction(rawTx);
        var serializedTx = near_api_js_1.utils.serialize.serialize(near_api_js_1.transactions.SCHEMA, transaction);
        var serializedTxHash = new Uint8Array(js_sha256_1.default.sha256.array(serializedTx));
        var keyPair = KEYSTORE.getKeyPair(seed, path);
        var signature = keyPair.sign(serializedTxHash);
        var signedTransaction = new near_api_js_1.transactions.SignedTransaction({
            transaction: transaction,
            signature: new near_api_js_1.transactions.Signature({
                keyType: transaction.publicKey.keyType,
                data: signature.signature,
            }),
        });
        return {
            rawTx: rawTx,
            signedTx: signedTransaction,
        };
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map