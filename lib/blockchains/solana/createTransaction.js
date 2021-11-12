"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
var web3_js_1 = require("@solana/web3.js");
function createInstruction(ix) {
    if (typeof ix.transactionType !== "number") {
        throw new Error("Instruction has no transaction type");
    }
    switch (ix.transactionType) {
        case 0: {
            // SystemProgram.transfer
            if (typeof ix.amountOfSOL !== "number" &&
                typeof ix.amountOfSOL !== "string") {
                throw new Error("Amount is required number");
            }
            var lamports = Number(ix.amountOfSOL) * web3_js_1.LAMPORTS_PER_SOL;
            var toPubkey = new web3_js_1.PublicKey(ix.toPubkey);
            var transferInstruction = web3_js_1.SystemProgram.transfer({
                fromPubkey: ix.fromPubkey,
                lamports: lamports,
                toPubkey: toPubkey,
            });
            return transferInstruction;
        }
        case 1: {
            // StakeProgram.createAccountWithSeed
            if (typeof ix.amountOfSOL !== "number" &&
                typeof ix.amountOfSOL !== "string") {
                throw new Error("Amount is required number");
            }
            var authorized = new web3_js_1.Authorized(ix.stakerAuthorizePubkey, ix.withdrawerAuthorizePubkey);
            var lamports = Number(ix.amountOfSOL) * web3_js_1.LAMPORTS_PER_SOL;
            var createStakeAccountInstruction = web3_js_1.StakeProgram.createAccountWithSeed({
                fromPubkey: ix.fromPubkey,
                stakePubkey: ix.stakePubkey,
                basePubkey: ix.basePubkey,
                seed: ix.stakeAccountSeed,
                authorized: authorized,
                lockup: new web3_js_1.Lockup(0, 0, new web3_js_1.PublicKey(0)),
                lamports: lamports,
            });
            return createStakeAccountInstruction;
        }
        case 2: {
            // StakeProgram.delegate
            var votePubkey = new web3_js_1.PublicKey(ix.votePubkey);
            var delegateTransactionInstruction = web3_js_1.StakeProgram.delegate({
                stakePubkey: ix.stakePubkey,
                authorizedPubkey: ix.authorizedPubkey,
                votePubkey: votePubkey,
            });
            return delegateTransactionInstruction;
        }
        case 3: {
            // StakeProgram.deactivate
            var undelegateTransactionInstruction = web3_js_1.StakeProgram.deactivate({
                authorizedPubkey: ix.authorizedPubkey,
                stakePubkey: ix.stakePubkey,
            });
            return undelegateTransactionInstruction;
        }
        default:
            break;
    }
    throw new Error("Create instrauction error");
}
function createTransaction(rawTx) {
    try {
        var transaction = new web3_js_1.Transaction({
            recentBlockhash: rawTx.recentBlockhash,
            feePayer: rawTx.feePayer,
        });
        for (var i = 0; i < rawTx.ixs.length; i += 1) {
            transaction.add(createInstruction(rawTx.ixs[i]));
        }
        return transaction;
    }
    catch (error) {
        throw new Error(error);
    }
}
exports.createTransaction = createTransaction;
//# sourceMappingURL=createTransaction.js.map