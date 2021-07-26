import {
  PublicKey,
  StakeProgram,
  Authorized,
  Transaction,
  LAMPORTS_PER_SOL,
  Lockup,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { RawTx } from "../../types";

function createInstruction(ix: any): Transaction | TransactionInstruction {
  if (typeof ix.transactionType !== "number") {
    throw new Error("Instruction has no transaction type");
  }
  switch (ix.transactionType) {
    case 0: {
      // SystemProgram.transfer
      if (
        typeof ix.amountOfSOL !== "number" &&
        typeof ix.amountOfSOL !== "string"
      ) {
        throw new Error("Amount is required number");
      }
      const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
      const toPubkey = new PublicKey(ix.toPubkey);
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: ix.fromPubkey,
        lamports,
        toPubkey,
      });
      return transferInstruction;
    }
    case 1: {
      // StakeProgram.createAccountWithSeed
      if (
        typeof ix.amountOfSOL !== "number" &&
        typeof ix.amountOfSOL !== "string"
      ) {
        throw new Error("Amount is required number");
      }
      const authorized = new Authorized(
        ix.stakerAuthorizePubkey,
        ix.withdrawerAuthorizePubkey
      );
      const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
      const createStakeAccountInstruction = StakeProgram.createAccountWithSeed({
        fromPubkey: ix.fromPubkey,
        stakePubkey: ix.stakePubkey,
        basePubkey: ix.basePubkey,
        seed: ix.stakeAccountSeed,
        authorized,
        lockup: new Lockup(0, 0, new PublicKey(0)),
        lamports,
      });
      return createStakeAccountInstruction;
    }
    case 2: {
      // StakeProgram.delegate
      const votePubkey = new PublicKey(ix.votePubkey);
      const delegateTransactionInstruction = StakeProgram.delegate({
        stakePubkey: ix.stakePubkey,
        authorizedPubkey: ix.authorizedPubkey,
        votePubkey,
      });
      return delegateTransactionInstruction;
    }
    case 3: {
      // StakeProgram.deactivate
      const undelegateTransactionInstruction = StakeProgram.deactivate({
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

export function createTransaction(rawTx: RawTx): Transaction {
  try {
    const transaction = new Transaction({
      recentBlockhash: rawTx.recentBlockhash,
      feePayer: rawTx.feePayer,
    });
    for (let i = 0; i < rawTx.ixs.length; i += 1) {
      transaction.add(createInstruction(rawTx.ixs[i]));
    }
    return transaction;
  } catch (error) {
    throw new Error(error);
  }
}
