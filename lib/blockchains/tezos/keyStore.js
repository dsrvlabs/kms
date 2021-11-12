"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYSTORE = void 0;
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var near_hd_key_1 = require("near-hd-key");
var hw_1 = require("./hw");
// import { RawTx, SignedTx } from "../../types";
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getAccount = function (seed, path) {
        var key = near_hd_key_1.derivePath("m/44'/" + path.type + "'/" + path.account + "'/" + path.index + "'", seed.toString("hex")).key;
        var keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(key);
        return {
            address: hw_1.encodeAddress(Buffer.from(keyPair.publicKey)),
            publicKey: Buffer.from(keyPair.publicKey).toString("hex"),
        };
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map