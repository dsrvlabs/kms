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
exports.signMsgFromKeyStore = exports.signTxFromKeyStore = exports.getAccountFromKeyStore = void 0;
var bip39_1 = require("bip39");
var bip32_1 = require("bip32");
var types_1 = require("./types");
var keyStore_1 = require("./blockchains/ethereum/keyStore");
function getAccountFromKeyStore(path, mnemonic) {
    return __awaiter(this, void 0, void 0, function () {
        var seed, node, child, account;
        return __generator(this, function (_a) {
            try {
                seed = bip39_1.mnemonicToSeedSync(mnemonic);
                node = bip32_1.fromSeed(seed);
                child = node.derivePath("m/44'/" + path.type + "'/" + path.account + "'/0/" + path.index);
                switch (path.type) {
                    case types_1.CHAIN.ETHEREUM:
                    case types_1.CHAIN.KLAYTN:
                    case types_1.CHAIN.CELO: {
                        account = keyStore_1.KEYSTORE.getAccount(child);
                        return [2 /*return*/, account];
                    }
                    // add blockchains....
                    // blockchains
                    default:
                        break;
                }
                return [2 /*return*/, null];
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
exports.getAccountFromKeyStore = getAccountFromKeyStore;
function signTxFromKeyStore(path, mnemonic, rawTx) {
    return __awaiter(this, void 0, void 0, function () {
        var seed, node, child, response;
        return __generator(this, function (_a) {
            try {
                seed = bip39_1.mnemonicToSeedSync(mnemonic);
                node = bip32_1.fromSeed(seed);
                child = node.derivePath("m/44'/" + path.type + "'/" + path.account + "'/0/" + path.index);
                switch (path.type) {
                    case types_1.CHAIN.ETHEREUM:
                    case types_1.CHAIN.KLAYTN:
                    case types_1.CHAIN.CELO: {
                        response = keyStore_1.KEYSTORE.signTx(child, rawTx);
                        return [2 /*return*/, __assign({}, response)];
                    }
                    // add blockchains....
                    // blockchains
                    default:
                        break;
                }
                return [2 /*return*/, { rawTx: rawTx }];
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                return [2 /*return*/, { rawTx: rawTx }];
            }
            return [2 /*return*/];
        });
    });
}
exports.signTxFromKeyStore = signTxFromKeyStore;
function signMsgFromKeyStore(path, mnemonic, msg) {
    return __awaiter(this, void 0, void 0, function () {
        var seed, node;
        return __generator(this, function (_a) {
            try {
                seed = bip39_1.mnemonicToSeedSync(mnemonic);
                node = bip32_1.fromSeed(seed);
                node.derivePath("m/44'/" + path.type + "'/" + path.account + "'/0/" + path.index);
                return [2 /*return*/, { msg: msg }];
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                return [2 /*return*/, { msg: msg }];
            }
            return [2 /*return*/];
        });
    });
}
exports.signMsgFromKeyStore = signMsgFromKeyStore;
//# sourceMappingURL=keyStore.js.map