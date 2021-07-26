import { encode } from "bs58";
import { derivePath } from "near-hd-key";
import { Keypair, Signer } from "@solana/web3.js";
import { createTransaction } from "./createInstruction";
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

  static async signTx(
    seed: Buffer,
    path: BIP44,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const payer = KEYSTORE.getKeypair(seed, path);
    const transaction = createTransaction(rawTx);
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
