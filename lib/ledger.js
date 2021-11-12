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
exports.signMsgFromLedger = exports.signTxFromLedger = exports.getAccountFromLedger = void 0;
var types_1 = require("./types");
var terra_1 = require("./blockchains/cosmos/ledger/terra");
var cosmos_1 = require("./blockchains/cosmos/ledger/cosmos");
function getAccountFromLedger(path, transport) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, account, account, account, account, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    _a = path.type;
                    switch (_a) {
                        case types_1.CHAIN.COSMOS: return [3 /*break*/, 1];
                        case types_1.CHAIN.PERSISTENCE: return [3 /*break*/, 3];
                        case types_1.CHAIN.AGORIC: return [3 /*break*/, 5];
                        case types_1.CHAIN.TERRA: return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1: return [4 /*yield*/, cosmos_1.LEDGER.getAccount(path, transport, 'cosmos')];
                case 2:
                    account = _b.sent();
                    return [2 /*return*/, account];
                case 3: return [4 /*yield*/, cosmos_1.LEDGER.getAccount(path, transport, 'persistence')];
                case 4:
                    account = _b.sent();
                    return [2 /*return*/, account];
                case 5: return [4 /*yield*/, cosmos_1.LEDGER.getAccount(path, transport, 'agoric')];
                case 6:
                    account = _b.sent();
                    return [2 /*return*/, account];
                case 7: return [4 /*yield*/, terra_1.LEDGER.getAccount(path, transport)];
                case 8:
                    account = _b.sent();
                    return [2 /*return*/, account];
                case 9: return [3 /*break*/, 10];
                case 10: return [2 /*return*/, null];
                case 11:
                    error_1 = _b.sent();
                    // eslint-disable-next-line no-console
                    console.error(error_1);
                    return [2 /*return*/, null];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.getAccountFromLedger = getAccountFromLedger;
function signTxFromLedger(path, transport, rawTx) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, response, response, response, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    _a = path.type;
                    switch (_a) {
                        case types_1.CHAIN.COSMOS: return [3 /*break*/, 1];
                        case types_1.CHAIN.PERSISTENCE: return [3 /*break*/, 3];
                        case types_1.CHAIN.TERRA: return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 1: return [4 /*yield*/, cosmos_1.LEDGER.signTx(path, transport, rawTx)];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, __assign({}, response)];
                case 3: return [4 /*yield*/, cosmos_1.LEDGER.signTx(path, transport, rawTx)];
                case 4:
                    response = _b.sent();
                    return [2 /*return*/, __assign({}, response)];
                case 5: return [4 /*yield*/, terra_1.LEDGER.signTx(path, transport, rawTx)];
                case 6:
                    response = _b.sent();
                    return [2 /*return*/, __assign({}, response)];
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/, { rawTx: rawTx }];
                case 9:
                    error_2 = _b.sent();
                    // eslint-disable-next-line no-console
                    console.error(error_2);
                    return [2 /*return*/, { rawTx: rawTx }];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.signTxFromLedger = signTxFromLedger;
function signMsgFromLedger(path, _transport, msg) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                switch (path.type) {
                    // blockchains
                    // add blockchains....
                    // blockchains
                    default:
                        break;
                }
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
exports.signMsgFromLedger = signMsgFromLedger;
//# sourceMappingURL=ledger.js.map