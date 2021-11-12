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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLedger = exports.CreateKMS = exports.KMS = exports.createExtension = exports.createWeb3 = exports.getAlgo2HashKey = exports.CHAIN = exports.signTxFromKeyStore = exports.getAccountFromKeyStore = exports.createKeyStore = void 0;
var hw_transport_webusb_1 = __importDefault(require("@ledgerhq/hw-transport-webusb"));
var hw_transport_web_ble_1 = __importDefault(require("@ledgerhq/hw-transport-web-ble"));
var types_1 = require("./types");
Object.defineProperty(exports, "CHAIN", { enumerable: true, get: function () { return types_1.CHAIN; } });
var argon2_1 = require("./argon2");
Object.defineProperty(exports, "createKeyStore", { enumerable: true, get: function () { return argon2_1.createKeyStore; } });
Object.defineProperty(exports, "getAlgo2HashKey", { enumerable: true, get: function () { return argon2_1.getAlgo2HashKey; } });
var keyStore_1 = require("./keyStore");
Object.defineProperty(exports, "getAccountFromKeyStore", { enumerable: true, get: function () { return keyStore_1.getAccountFromKeyStore; } });
Object.defineProperty(exports, "signTxFromKeyStore", { enumerable: true, get: function () { return keyStore_1.signTxFromKeyStore; } });
var ledger_1 = require("./ledger");
var web3_1 = require("./provider/web3");
Object.defineProperty(exports, "createWeb3", { enumerable: true, get: function () { return web3_1.createWeb3; } });
var extension_1 = require("./provider/extension");
Object.defineProperty(exports, "createExtension", { enumerable: true, get: function () { return extension_1.createExtension; } });
var KMS = /** @class */ (function () {
    function KMS(ledger) {
        var _this = this;
        var _a;
        this.keyStore = ledger.keyStore;
        this.transport = ledger.transport;
        (_a = this.transport) === null || _a === void 0 ? void 0 : _a.on('disconnect', function () {
            var _a;
            if (ledger.onDisconnect) {
                ledger.onDisconnect();
            }
            (_a = _this.transport) === null || _a === void 0 ? void 0 : _a.off('disconnect', function () { });
            _this.close();
        });
    }
    KMS.prototype.isLedger = function () {
        return !!this.transport;
    };
    KMS.prototype.getAccount = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var mnemonic, account, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.keyStore) return [3 /*break*/, 3];
                        return [4 /*yield*/, argon2_1.getMnemonic(path.password || '', this.keyStore)];
                    case 1:
                        mnemonic = _a.sent();
                        return [4 /*yield*/, keyStore_1.getAccountFromKeyStore(path, mnemonic)];
                    case 2:
                        account = _a.sent();
                        return [2 /*return*/, account];
                    case 3:
                        if (!this.transport) return [3 /*break*/, 5];
                        return [4 /*yield*/, ledger_1.getAccountFromLedger(path, this.transport)];
                    case 4:
                        account = _a.sent();
                        return [2 /*return*/, account];
                    case 5: return [2 /*return*/, null];
                }
            });
        });
    };
    KMS.prototype.signTx = function (path, rawTx) {
        return __awaiter(this, void 0, void 0, function () {
            var mnemonic, signedTx, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.keyStore) return [3 /*break*/, 3];
                        return [4 /*yield*/, argon2_1.getMnemonic(path.password || '', this.keyStore)];
                    case 1:
                        mnemonic = _a.sent();
                        return [4 /*yield*/, keyStore_1.signTxFromKeyStore(path, mnemonic, rawTx)];
                    case 2:
                        signedTx = _a.sent();
                        return [2 /*return*/, signedTx];
                    case 3:
                        if (!this.transport) return [3 /*break*/, 5];
                        return [4 /*yield*/, ledger_1.signTxFromLedger(path, this.transport, rawTx)];
                    case 4:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 5: return [2 /*return*/, { rawTx: rawTx }];
                }
            });
        });
    };
    KMS.prototype.signMsg = function (path, msg) {
        return __awaiter(this, void 0, void 0, function () {
            var mnemonic, response, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.keyStore) return [3 /*break*/, 3];
                        return [4 /*yield*/, argon2_1.getMnemonic(path.password || '', this.keyStore)];
                    case 1:
                        mnemonic = _a.sent();
                        return [4 /*yield*/, keyStore_1.signMsgFromKeyStore(path, mnemonic, msg)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        if (!this.transport) return [3 /*break*/, 5];
                        return [4 /*yield*/, ledger_1.signMsgFromLedger(path, this.transport, msg)];
                    case 4:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 5: return [2 /*return*/, { msg: msg }];
                }
            });
        });
    };
    KMS.prototype.close = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.transport) return [3 /*break*/, 4];
                        id = this.transport.id;
                        if (!id) return [3 /*break*/, 2];
                        return [4 /*yield*/, hw_transport_web_ble_1.default.disconnect(id)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, ((_a = this.transport) === null || _a === void 0 ? void 0 : _a.close())];
                    case 3:
                        _b.sent();
                        this.transport = null;
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return KMS;
}());
exports.KMS = KMS;
function CreateKMS(keyStoreJson) {
    return __awaiter(this, void 0, void 0, function () {
        var ledger;
        return __generator(this, function (_a) {
            ledger = {
                keyStore: keyStoreJson,
                transport: null,
            };
            return [2 /*return*/, new KMS(ledger)];
        });
    });
}
exports.CreateKMS = CreateKMS;
function CreateLedger(isUsb, onDisconnect) {
    return __awaiter(this, void 0, void 0, function () {
        var ledger, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = {
                        keyStore: null
                    };
                    if (!isUsb) return [3 /*break*/, 2];
                    return [4 /*yield*/, hw_transport_webusb_1.default.create()];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, hw_transport_web_ble_1.default.create()];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    ledger = (_b.transport = _a,
                        _b.onDisconnect = onDisconnect,
                        _b);
                    return [2 /*return*/, new KMS(ledger)];
            }
        });
    });
}
exports.CreateLedger = CreateLedger;
//# sourceMappingURL=index.js.map