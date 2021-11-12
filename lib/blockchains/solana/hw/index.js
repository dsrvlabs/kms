"use strict";
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
exports.getPublicKey = exports.signBytes = exports.signTransaction = exports.getSolanaDerivationPath = void 0;
var web3_js_1 = require("@solana/web3.js");
var INS_GET_PUBKEY = 0x05;
var INS_SIGN_MESSAGE = 0x06;
var P1_NON_CONFIRM = 0x00;
var P1_CONFIRM = 0x01;
var P2_EXTEND = 0x01;
var P2_MORE = 0x02;
var MAX_PAYLOAD = 255;
var LEDGER_CLA = 0xe0;
/*
 * Helper for chunked send of large payloads
 */
function ledgerSend(transport, instruction, p1, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var p2, payloadOffset, chunk_1, reply_1, chunk, reply;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    p2 = 0;
                    payloadOffset = 0;
                    if (!(payload.length > MAX_PAYLOAD)) return [3 /*break*/, 3];
                    _a.label = 1;
                case 1:
                    if (!(payload.length - payloadOffset > MAX_PAYLOAD)) return [3 /*break*/, 3];
                    chunk_1 = payload.slice(payloadOffset, payloadOffset + MAX_PAYLOAD);
                    payloadOffset += MAX_PAYLOAD;
                    return [4 /*yield*/, transport.send(LEDGER_CLA, instruction, p1, 
                        // eslint-disable-next-line no-bitwise
                        p2 | P2_MORE, chunk_1)];
                case 2:
                    reply_1 = _a.sent();
                    if (reply_1.length !== 2) {
                        throw new Error("Received unexpected reply payload");
                    }
                    // eslint-disable-next-line no-bitwise
                    p2 |= P2_EXTEND;
                    return [3 /*break*/, 1];
                case 3:
                    chunk = payload.slice(payloadOffset);
                    return [4 /*yield*/, transport.send(LEDGER_CLA, instruction, p1, p2, chunk)];
                case 4:
                    reply = _a.sent();
                    return [2 /*return*/, reply.slice(0, reply.length - 2)];
            }
        });
    });
}
// eslint-disable-next-line no-bitwise
var BIP32_HARDENED_BIT = (1 << 31) >>> 0;
function harden(n) {
    if (n === void 0) { n = 0; }
    // eslint-disable-next-line no-bitwise
    return (n | BIP32_HARDENED_BIT) >>> 0;
}
function getSolanaDerivationPath(account, change) {
    var length;
    if (account !== undefined) {
        if (change !== undefined) {
            length = 4;
        }
        else {
            length = 3;
        }
    }
    else {
        length = 2;
    }
    var derivationPath = Buffer.alloc(1 + length * 4);
    // eslint-disable-next-line
    var offset = 0;
    offset = derivationPath.writeUInt8(length, offset);
    offset = derivationPath.writeUInt32BE(harden(44), offset); // Using BIP44
    offset = derivationPath.writeUInt32BE(harden(501), offset); // Solana's BIP44 path
    if (length > 2) {
        offset = derivationPath.writeUInt32BE(harden(account), offset);
        if (length === 4) {
            // @FIXME: https://github.com/project-serum/spl-token-wallet/issues/59
            // eslint-disable-next-line no-unused-vars
            offset = derivationPath.writeUInt32BE(harden(change), offset);
        }
    }
    return derivationPath;
}
exports.getSolanaDerivationPath = getSolanaDerivationPath;
function signTransaction(transport, transaction, derivationPath) {
    if (derivationPath === void 0) { derivationPath = getSolanaDerivationPath(); }
    return __awaiter(this, void 0, void 0, function () {
        var messageBytes;
        return __generator(this, function (_a) {
            messageBytes = transaction.serializeMessage();
            // eslint-disable-next-line no-use-before-define
            return [2 /*return*/, signBytes(transport, messageBytes, derivationPath)];
        });
    });
}
exports.signTransaction = signTransaction;
function signBytes(transport, bytes, derivationPath) {
    if (derivationPath === void 0) { derivationPath = getSolanaDerivationPath(); }
    return __awaiter(this, void 0, void 0, function () {
        var numPaths, payload;
        return __generator(this, function (_a) {
            numPaths = Buffer.alloc(1);
            numPaths.writeUInt8(1, 0);
            payload = Buffer.concat([numPaths, derivationPath, bytes]);
            // @FIXME: must enable blind signing in Solana Ledger App per https://github.com/project-serum/spl-token-wallet/issues/71
            // See also https://github.com/project-serum/spl-token-wallet/pull/23#issuecomment-712317053
            return [2 /*return*/, ledgerSend(transport, INS_SIGN_MESSAGE, P1_CONFIRM, payload)];
        });
    });
}
exports.signBytes = signBytes;
function getPublicKey(transport, derivationPath) {
    if (derivationPath === void 0) { derivationPath = getSolanaDerivationPath(); }
    return __awaiter(this, void 0, void 0, function () {
        var publicKeyBytes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ledgerSend(transport, INS_GET_PUBKEY, P1_NON_CONFIRM, derivationPath)];
                case 1:
                    publicKeyBytes = _a.sent();
                    return [2 /*return*/, new web3_js_1.PublicKey(publicKeyBytes)];
            }
        });
    });
}
exports.getPublicKey = getPublicKey;
//# sourceMappingURL=index.js.map