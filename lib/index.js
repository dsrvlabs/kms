"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMnemonic = void 0;
var bip39_1 = require("bip39");
function CreateMnemonic() {
    return bip39_1.generateMnemonic(256);
}
exports.CreateMnemonic = CreateMnemonic;
//# sourceMappingURL=index.js.map