import { BIP32Interface } from "bip32";
import { Keypair } from "@solana/web3.js";

export class KEYSTORE {
  static getAccount(node: BIP32Interface): string {
    const pk = node.privateKey
      ? new Uint8Array(node.privateKey.buffer)
      : new Uint8Array(32);
    const { publicKey } = Keypair.fromSeed(pk);
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
