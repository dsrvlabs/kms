import { derivePath } from "near-hd-key";
import { BIP44 } from "../../types";

const EC = require("elliptic").ec;

export class KEYSTORE {
  static getAccount(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/1'/${path.type}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const ec = new EC("secp256k1");
    const keyPair = ec.keyFromPrivate(key);
    return keyPair.getPublic().encode("hex", false);
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
