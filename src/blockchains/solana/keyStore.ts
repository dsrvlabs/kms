import base58 from "bs58";
import { derivePath } from "near-hd-key";
import { Keypair, Transaction } from "@solana/web3.js";
import { Account, BIP44, SignedTx } from "../../types";

export class KEYSTORE {
  static getPrivateKey(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/${path.index}'`,
      seed.toString("hex")
    );
    return `0x${Buffer.from(key).toString("hex")}`;
  }

  private static getKeypair(seed: Buffer | string, path?: BIP44): Keypair {
    const temp =
      typeof seed === "string"
        ? Buffer.from(seed.replace("0x", ""), "hex")
        : seed;
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

  static signTx(
    seed: Buffer | string,
    serializedTx: string,
    path?: BIP44
  ): SignedTx {
    const payer = KEYSTORE.getKeypair(seed, path);
    const transaction = Transaction.from(
      Buffer.from(serializedTx.replace("0x", ""), "hex")
    );
    transaction.sign(payer);
    return {
      hash: transaction.signature
        ? base58.encode(Uint8Array.from(transaction.signature))
        : "",
      serializedTx,
      signature: `0x${transaction.signature?.toString("hex")}`,
    };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
