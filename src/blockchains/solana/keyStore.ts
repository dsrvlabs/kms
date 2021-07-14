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
} from "@solana/web3.js";
import { BIP44, RawTx } from "../../types";

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

  static createTransaction(rawTx: RawTx): any {
    const transaction = new Transaction({
      recentBlockhash: rawTx.recentBlockhash,
      feePayer: rawTx.feePayer,
    });
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < rawTx.ixs.length; i++) {
      const ix = rawTx.ixs[i];
      if (ix.transactionType === 0) {
        const payerPublicKey = ix.fromPubkey;
        const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
        const toPubkey = new PublicKey(ix.toPubkey);
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: payerPublicKey,
          lamports,
          toPubkey,
        });
        transaction.add(transferInstruction);
      }
      if (ix.transactionType === 1) {
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
        const votePubkey = new PublicKey(ix.votePubkey);
        const delegateTransactionInstruction = StakeProgram.delegate({
          stakePubkey: ix.stakePubkey,
          authorizedPubkey: payerPublicKey,
          votePubkey,
        });
        transaction.add(createStakeAccountInstruction);
        transaction.add(delegateTransactionInstruction);
      }
    }
    return transaction;
  }

  static async signTx(seed: Buffer, path: BIP44, rawTx: RawTx) {
    const payer = KEYSTORE.getKeypair(seed, path);
    const transaction = KEYSTORE.createTransaction(rawTx);
    transaction.sign(<Signer>payer);
    return {
      signatures: {
        signature: transaction.signatures[0].signature,
        publicKey: transaction.signatures[0].publicKey,
      },
      rawTransaction: rawTx,
    };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
