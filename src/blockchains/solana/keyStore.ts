import { encode } from "bs58";
import { derivePath } from "near-hd-key";
import {
  Keypair,
  PublicKey,
  StakeProgram,
  Authorized,
  Transaction,
  Signer,
  LAMPORTS_PER_SOL,
  Lockup,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { BIP44, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getKeypair(seed: Buffer, path: BIP44): Keypair {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/${path.index}'`,
      seed.toString("hex")
    );
    return Keypair.fromSeed(key);
  }

  static getAccount(seed: Buffer, path: BIP44): string {
    const keypair = KEYSTORE.getKeypair(seed, path);
    return keypair.publicKey.toString();
  }

  static getPrivateKey(seed: Buffer, path: BIP44): string {
    const keypair = KEYSTORE.getKeypair(seed, path);
    return encode(keypair.secretKey);
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
        transaction.add(KEYSTORE.createInstruction(rawTx.ixs[i]));
      }
      return transaction;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async signTx(
    seed: Buffer,
    path: BIP44,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const payer = KEYSTORE.getKeypair(seed, path);
    const transaction = KEYSTORE.createTransaction(rawTx);
    if (transaction.instructions.length === 0) {
      throw new Error("No instructions provided");
    }
    transaction.sign(<Signer>payer);
    return {
      rawTx,
      signedTx: transaction,
    };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
