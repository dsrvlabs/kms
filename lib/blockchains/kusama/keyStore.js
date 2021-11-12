"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYSTORE = void 0;
var util_crypto_1 = require("@polkadot/util-crypto");
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getAccount = function (node) {
        var ss58Format = 2;
        var pk = node.privateKey
            ? new Uint8Array(node.privateKey.buffer)
            : new Uint8Array(32);
        var account = util_crypto_1.naclKeypairFromSeed(pk);
        return {
            address: util_crypto_1.encodeAddress("0x" + Buffer.from(account.publicKey).toString("hex"), ss58Format),
            publicKey: Buffer.from(account.publicKey).toString("hex"),
        };
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map