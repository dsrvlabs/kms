import { derivePath } from "near-hd-key";
import { Keypair } from "@solana/web3.js";
import { createTransaction } from "./createTransaction";
import { Account, BIP44, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getPrivateKey(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/${path.index}'`,
      seed.toString("hex")
    );
    return `0x${Buffer.from(key).toString("hex")}`;
  }

  private static getKeypair(seed: Buffer | string, path?: BIP44): Keypair {
    const temp = typeof seed === "string" ? Buffer.from(seed) : seed;
    const key = path
      ? KEYSTORE.getPrivateKey(temp, path).replace("0x", "")
      : temp.toString("hex");
    return Keypair.fromSeed(Buffer.from(key, "hex"));
  }

  static getAccount(seed: Buffer | string, path?: BIP44): Account {
    const keypair = KEYSTORE.getKeypair(seed, path);
    return {
      address: keypair.publicKey.toString(),
      publicKey: keypair.publicKey.toString(),
    };
  }

  static signTx(seed: Buffer | string, rawTx: RawTx, path?: BIP44): SignedTx {
    const payer = KEYSTORE.getKeypair(seed, path);
    const transaction = createTransaction(rawTx);
    if (transaction.instructions.length === 0) {
      throw new Error("No instructions provided");
    }
    transaction.sign(payer);
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
