import { Keypair } from "@solana/web3.js";
import { derivePath } from "near-hd-key";
import { BIP44 } from "../../types";

export class KEYSTORE {
  static getAccount(seed: string, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/${path.index}'`,
      seed
    );
    const { publicKey } = Keypair.fromSeed(key);
    return publicKey.toBase58();
  }
  /*
  static signTx(node: BIP32Interface, rawTx: RawTx): { [key: string]: any } {
    // ...
  }
  */

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
