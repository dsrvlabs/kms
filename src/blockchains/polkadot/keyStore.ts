import { derivePath } from "near-hd-key";
import { naclKeypairFromSeed, encodeAddress } from "@polkadot/util-crypto";
import { BIP44 } from "../../types";

export class KEYSTORE {
  static getAccount(seed: Buffer, path: BIP44): string {
    const ss58Format = 0;
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    return encodeAddress(
      `0x${Buffer.from(naclKeypairFromSeed(key).publicKey).toString("hex")}`,
      ss58Format
    );
  }
  /*
  static signTx(node: BIP32Interface, rawTx: RawTx): SignedTx {
    // ...
  }
  */

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
