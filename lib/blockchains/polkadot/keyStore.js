"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYSTORE = void 0;
var near_hd_key_1 = require("near-hd-key");
var util_crypto_1 = require("@polkadot/util-crypto");
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getAccount = function (seed, path) {
        var ss58Format = 0;
        var key = near_hd_key_1.derivePath("m/44'/" + path.type + "'/" + path.account + "'/0'/" + path.index + "'", seed.toString("hex")).key;
        var account = util_crypto_1.naclKeypairFromSeed(key);
        return {
            address: util_crypto_1.encodeAddress("0x" + Buffer.from(account.publicKey).toString("hex"), ss58Format),
            publicKey: "0x" + Buffer.from(account.publicKey).toString("hex"),
        };
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map