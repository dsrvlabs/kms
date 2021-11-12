"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeAddress = void 0;
// https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-tezos/src/Tezos.ts
var bs58check_1 = __importDefault(require("bs58check"));
var blake2b = require("blake2b");
var encodeAddress = function (publicKey) {
    var pkhB58Prefix = Buffer.from([6, 161, 159]);
    var key = publicKey;
    var keyHashSize = 20;
    var hash = blake2b(keyHashSize);
    hash.update(key);
    hash.digest((hash = Buffer.alloc(keyHashSize)));
    var address = bs58check_1.default.encode(Buffer.concat([pkhB58Prefix, hash]));
    return address;
};
exports.encodeAddress = encodeAddress;
//# sourceMappingURL=index.js.map