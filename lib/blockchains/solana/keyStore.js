"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYSTORE = void 0;
var bs58_1 = require("bs58");
var near_hd_key_1 = require("near-hd-key");
var web3_js_1 = require("@solana/web3.js");
var createTransaction_1 = require("./createTransaction");
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getKeypair = function (seed, path) {
        var key = near_hd_key_1.derivePath("m/44'/" + path.type + "'/" + path.account + "'/" + path.index + "'", seed.toString("hex")).key;
        return web3_js_1.Keypair.fromSeed(key);
    };
    KEYSTORE.getAccount = function (seed, path) {
        var keypair = KEYSTORE.getKeypair(seed, path);
        return {
            address: keypair.publicKey.toString(),
            publicKey: keypair.publicKey.toString(),
        };
    };
    KEYSTORE.getPrivateKey = function (seed, path) {
        var keypair = KEYSTORE.getKeypair(seed, path);
        return bs58_1.encode(keypair.secretKey);
    };
    KEYSTORE.signTx = function (seed, path, rawTx) {
        var payer = KEYSTORE.getKeypair(seed, path);
        var transaction = createTransaction_1.createTransaction(rawTx);
        if (transaction.instructions.length === 0) {
            throw new Error("No instructions provided");
        }
        transaction.sign(payer);
        return {
            rawTx: rawTx,
            signedTx: transaction,
        };
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map