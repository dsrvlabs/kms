import { BIP32Interface } from "bip32";
import { privateToAddress, toChecksumAddress } from "ethereumjs-util";
// import { RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getAccount(node: BIP32Interface): string {
    const { privateKey } = node;
    return privateKey
      ? toChecksumAddress(`0x${privateToAddress(privateKey).toString("hex")}`)
      : "";
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
