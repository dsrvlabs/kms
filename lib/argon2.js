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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeyStore = exports.getMnemonic = exports.getAlgo2HashKey = void 0;
var node_jose_1 = require("node-jose");
var bs58_1 = require("bs58");
var crypto_1 = require("crypto");
var hash = require('argon2-browser').hash;
var LENGTH = 32;
function getAlgo2HashKey(password, keyStore) {
    return __awaiter(this, void 0, void 0, function () {
        var buf, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hash({
                        pass: password,
                        time: keyStore.t,
                        mem: keyStore.m,
                        salt: bs58_1.decode(keyStore.s),
                        hashLen: LENGTH,
                    })];
                case 1:
                    buf = _a.sent();
                    return [4 /*yield*/, node_jose_1.JWK.asKey({
                            kty: 'oct',
                            k: node_jose_1.util.base64url.encode(buf.hashHex),
                        })];
                case 2:
                    key = _a.sent();
                    return [2 /*return*/, key];
            }
        });
    });
}
exports.getAlgo2HashKey = getAlgo2HashKey;
function getMnemonic(password, keyStore) {
    return __awaiter(this, void 0, void 0, function () {
        var key, mnemonic;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAlgo2HashKey(password || '', keyStore)];
                case 1:
                    key = _a.sent();
                    if (!key) return [3 /*break*/, 3];
                    return [4 /*yield*/, node_jose_1.JWE.createDecrypt(key).decrypt(keyStore.j.join('.'))];
                case 2:
                    mnemonic = _a.sent();
                    return [2 /*return*/, mnemonic.plaintext.toString()];
                case 3: return [2 /*return*/, ''];
            }
        });
    });
}
exports.getMnemonic = getMnemonic;
function createKeyStore(mnemonic, password, time, mem) {
    if (time === void 0) { time = 9; }
    if (mem === void 0) { mem = 262144; }
    return __awaiter(this, void 0, void 0, function () {
        var encoder, opt, key, jwe;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    opt = { t: time, m: mem, s: bs58_1.encode(crypto_1.randomBytes(LENGTH)), j: [] };
                    return [4 /*yield*/, getAlgo2HashKey(password, opt)];
                case 1:
                    key = _a.sent();
                    if (!key) return [3 /*break*/, 3];
                    return [4 /*yield*/, node_jose_1.JWE.createEncrypt({ format: 'compact', contentAlg: 'A256GCM' }, key)
                            .update(encoder.encode(mnemonic.join(' ')))
                            .final()];
                case 2:
                    jwe = _a.sent();
                    return [2 /*return*/, __assign(__assign({}, opt), { j: jwe.split('.') })];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}
exports.createKeyStore = createKeyStore;
//# sourceMappingURL=argon2.js.map