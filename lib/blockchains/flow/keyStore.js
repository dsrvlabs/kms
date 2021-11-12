"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYSTORE = void 0;
var elliptic_1 = require("elliptic");
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getAccount = function (node) {
        var privateKey = node.privateKey;
        var ec = new elliptic_1.ec("secp256k1");
        var keyPair = ec.keyFromPrivate(privateKey);
        return {
            address: keyPair.getPublic().encode("hex", false),
            publicKey: keyPair.getPublic().encode("hex", false),
        };
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map