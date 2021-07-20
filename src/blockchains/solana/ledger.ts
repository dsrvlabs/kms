import Transport from "@ledgerhq/hw-transport";
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
import { getPublicKey, getSolanaDerivationPath, signTransaction } from "./hw";
import { BIP44, RawTx } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    const response = await getPublicKey(
      transport,
      getSolanaDerivationPath(path.account, path.index)
    );
    return response.toBase58();
  }

  private static createInstruction(
    ix: any
  ): Transaction | TransactionInstruction {
    if (typeof ix.transactionType !== "number") {
      throw new Error("Instruction has no transaction type");
    }
    switch (ix.transactionType) {
      case 0: {
        // SystemProgram.transfer
        const payerPublicKey = ix.fromPubkey;
        const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
        const toPubkey = new PublicKey(ix.toPubkey);
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: payerPublicKey,
          lamports,
          toPubkey,
        });
        return transferInstruction;
      }
      case 1: {
        // StakeProgram.createAccountWithSeed
        if (typeof ix.amountOfSOL !== "number") {
          throw new Error("Amount is required number");
        }
        const payerPublicKey = ix.fromPubkey;
        const authorized = new Authorized(
          ix.stakerAuthorizePubkey,
          ix.withdrawerAuthorizePubkey
        );
        const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
        const createStakeAccountInstruction =
          StakeProgram.createAccountWithSeed({
            fromPubkey: payerPublicKey,
            stakePubkey: ix.stakePubkey,
            basePubkey: payerPublicKey,
            seed: ix.stakeAccountSeed,
            authorized,
            lockup: new Lockup(0, 0, new PublicKey(0)),
            lamports,
          });
        return createStakeAccountInstruction;
      }
      case 2: {
        // StakeProgram.delegate
        const payerPublicKey = ix.fromPubkey;
        const votePubkey = new PublicKey(ix.votePubkey);
        const delegateTransactionInstruction = StakeProgram.delegate({
          stakePubkey: ix.stakePubkey,
          authorizedPubkey: payerPublicKey,
          votePubkey,
        });
        return delegateTransactionInstruction;
      }
      default:
        break;
    }
    throw new Error("Create instrauction error");
  }

  private static createTransaction(rawTx: RawTx): Transaction {
    try {
      const transaction = new Transaction({
        recentBlockhash: rawTx.recentBlockhash,
        feePayer: rawTx.feePayer,
      });
      for (let i = 0; i < rawTx.ixs.length; i += 1) {
        transaction.add(LEDGER.createInstruction(rawTx.ixs[i]));
      }
      return transaction;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    const transaction = LEDGER.createTransaction(rawTx);
    if (transaction.instructions.length === 0) {
      throw new Error("No instructions provided");
    }
    const signature = await signTransaction(
      transport,
      transaction,
      getSolanaDerivationPath(path.account, path.index)
    );
    transaction.addSignature(rawTx.feePayer, signature);
    return {
      signedTx: transaction,
    };
  }

  /*
  export function signMessage(
    path: BIP44,
    transport: Transport,
    msg: string) {
    // ...
  }
  */
}
