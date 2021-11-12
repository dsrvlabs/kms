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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.KEYSTORE = void 0;
var secp256k1 = __importStar(require("secp256k1"));
var crypto_js_1 = require("crypto-js");
var amino_1 = require("@cosmjs/amino");
var proto_signing_1 = require("@cosmjs/proto-signing");
var defaultRegistryTypes_1 = require("./defaultRegistryTypes");
var KEYSTORE = /** @class */ (function () {
    function KEYSTORE() {
    }
    KEYSTORE.getAccount = function (node, prefix) {
        var address = amino_1.pubkeyToAddress({
            type: "tendermint/PubKeySecp256k1",
            value: node.publicKey.toString("base64"),
        }, prefix);
        return { address: address, publicKey: node.publicKey.toString("base64") };
    };
    KEYSTORE.signTx = function (node, prefix, rawTx) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, accounts, txBodyEncodeObject, txBodyBytes, signDoc, _a, signature, signed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!node.privateKey) return [3 /*break*/, 4];
                        return [4 /*yield*/, proto_signing_1.DirectSecp256k1Wallet.fromKey(new Uint8Array(node.privateKey), prefix)];
                    case 1:
                        wallet = _b.sent();
                        return [4 /*yield*/, wallet.getAccounts()];
                    case 2:
                        accounts = _b.sent();
                        txBodyEncodeObject = {
                            typeUrl: "/cosmos.tx.v1beta1.TxBody",
                            value: {
                                messages: rawTx.msgs,
                                memo: rawTx.memo,
                            },
                        };
                        txBodyBytes = defaultRegistryTypes_1.registry.encode(txBodyEncodeObject);
                        signDoc = proto_signing_1.makeSignDoc(txBodyBytes, proto_signing_1.makeAuthInfoBytes([
                            {
                                pubkey: {
                                    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
                                    value: accounts[0].pubkey,
                                },
                                sequence: rawTx.sequence,
                            },
                        ], rawTx.fee.amount, rawTx.fee.gas), rawTx.chain_id, rawTx.accountNumber);
                        return [4 /*yield*/, wallet.signDirect(accounts[0].address, signDoc)];
                    case 3:
                        _a = _b.sent(), signature = _a.signature, signed = _a.signed;
                        return [2 /*return*/, { rawTx: rawTx, signedTx: { signature: signature, signed: signed } }];
                    case 4: return [2 /*return*/, { rawTx: rawTx }];
                }
            });
        });
    };
    KEYSTORE.signMessage = function (node, _prefix, msg) {
        return __awaiter(this, void 0, void 0, function () {
            var signature;
            return __generator(this, function (_a) {
                if (node.privateKey) {
                    signature = secp256k1.ecdsaSign(Buffer.from(crypto_js_1.enc.Base64.stringify(crypto_js_1.SHA256(msg)), "base64"), node.privateKey);
                    return [2 /*return*/, { msg: msg, signedMsg: __assign({}, signature) }];
                }
                return [2 /*return*/, { msg: msg }];
            });
        });
    };
    return KEYSTORE;
}());
exports.KEYSTORE = KEYSTORE;
//# sourceMappingURL=keyStore.js.map