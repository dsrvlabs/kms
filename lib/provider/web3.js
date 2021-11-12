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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeb3 = exports.getAltStatusMessage = exports.StatusCodes = exports.TransportStatusError = exports.TransportError = void 0;
var errors_1 = require("@ledgerhq/errors");
Object.defineProperty(exports, "TransportError", { enumerable: true, get: function () { return errors_1.TransportError; } });
Object.defineProperty(exports, "StatusCodes", { enumerable: true, get: function () { return errors_1.StatusCodes; } });
Object.defineProperty(exports, "getAltStatusMessage", { enumerable: true, get: function () { return errors_1.getAltStatusMessage; } });
Object.defineProperty(exports, "TransportStatusError", { enumerable: true, get: function () { return errors_1.TransportStatusError; } });
var Web3 = /** @class */ (function () {
    function Web3(transport, web3, extension) {
        var _this = this;
        this.send = function (cla, ins, p1, p2, data, statusList) {
            if (data === void 0) { data = Buffer.alloc(0); }
            if (statusList === void 0) { statusList = [errors_1.StatusCodes.OK]; }
            return __awaiter(_this, void 0, void 0, function () {
                var buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ledger.send(cla, ins, p1, p2, data, statusList)];
                        case 1:
                            buffer = _a.sent();
                            return [2 /*return*/, buffer];
                    }
                });
            });
        };
        this.ledger = transport;
        this.web3 = web3;
        this.extension = extension;
        this.web3.on("on", function (eventName) {
            return _this.ledger.on(eventName, function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return (_a = _this.extension).emit.apply(_a, __spreadArray([eventName], args));
            });
        });
        this.web3.on("off", function (eventName) {
            return _this.ledger.off(eventName, function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return (_a = _this.extension).emit.apply(_a, __spreadArray([eventName], args));
            });
        });
        this.web3.on("send", function (cla, ins, p1, p2, data, statusList) {
            if (data === void 0) { data = Buffer.alloc(0); }
            if (statusList === void 0) { statusList = [errors_1.StatusCodes.OK]; }
            return __awaiter(_this, void 0, void 0, function () {
                var buffer, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.ledger.send(cla, ins, p1, p2, data, statusList)];
                        case 1:
                            buffer = _a.sent();
                            this.extension.emit("receive", {
                                isSuccess: true,
                                result: buffer,
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            this.extension.emit("receive", {
                                isSuccess: false,
                                result: error_1,
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
    }
    return Web3;
}());
exports.default = Web3;
function createWeb3(transport, web3, extension) {
    return new Web3(transport, web3, extension);
}
exports.createWeb3 = createWeb3;
//# sourceMappingURL=web3.js.map