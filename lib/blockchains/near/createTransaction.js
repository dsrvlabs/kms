"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var near_api_js_1 = require("near-api-js");
function createInstruction(ix) {
    if (typeof ix.transactionType !== "number") {
        throw new Error("Instruction has no transaction type");
    }
    switch (ix.transactionType) {
        case 0: {
            // transfer
            var amount = near_api_js_1.utils.format.parseNearAmount(ix.amount);
            if (!amount) {
                throw new Error("Type 'null' is not assignable to amount");
            }
            return near_api_js_1.transactions.transfer(new bn_js_1.default(amount));
        }
        case 1: {
            // deposit_and_stake
            if (!ix.amount) {
                throw new Error("Amount is required");
            }
            if (!ix.gas) {
                throw new Error("Gas is required");
            }
            var amount = near_api_js_1.utils.format.parseNearAmount(ix.amount);
            if (!amount) {
                throw new Error("Type 'null' is not assignable to amount");
            }
            var gas = ix.gas;
            return near_api_js_1.transactions.functionCall("deposit_and_stake", new Uint8Array(), new bn_js_1.default(gas), new bn_js_1.default(amount));
        }
        case 2: {
            // unstake
            if (!ix.amount) {
                throw new Error("Amount is required");
            }
            if (!ix.gas) {
                throw new Error("Gas is required");
            }
            var amount = near_api_js_1.utils.format.parseNearAmount(ix.amount);
            if (!amount) {
                throw new Error("Type 'null' is not assignable to amount");
            }
            var gas = ix.gas;
            return near_api_js_1.transactions.functionCall("unstake", Buffer.from("{\"amount\": \"" + amount + "\"}"), new bn_js_1.default(gas), new bn_js_1.default(0));
        }
        case 3: {
            // unstake_all
            if (!ix.gas) {
                throw new Error("Gas is required");
            }
            var gas = ix.gas;
            return near_api_js_1.transactions.functionCall("unstake_all", new Uint8Array(), new bn_js_1.default(gas), new bn_js_1.default(0));
        }
        default:
            break;
    }
    throw new Error("Create instruction error");
}
function createTransaction(rawTx) {
    try {
        var signerId = rawTx.signerId;
        var receiverId = rawTx.receiverId;
        var nonce = rawTx.nonce;
        var recentBlockHash = rawTx.recentBlockHash;
        var publicKey = near_api_js_1.utils.PublicKey.fromString(rawTx.encodedPubKey);
        var actions = [];
        for (var i = 0; i < rawTx.ixs.length; i += 1) {
            var action = createInstruction(rawTx.ixs[i]);
            actions.push(action);
            if (actions == null) {
                throw new Error("No actions provided");
            }
        }
        var transaction = near_api_js_1.transactions.createTransaction(signerId, publicKey, receiverId, nonce, actions, recentBlockHash);
        return transaction;
    }
    catch (error) {
        throw new Error(error);
    }
}
exports.createTransaction = createTransaction;
//# sourceMappingURL=createTransaction.js.map