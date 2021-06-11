import { BIP32Interface } from "bip32";
import { privateToAddress, toChecksumAddress } from "ethereumjs-util";
// import { RawTx } from "../../types";

export class KEYSTORE {
  static getAccount(node: BIP32Interface): string {
    const { privateKey } = node;
    return privateKey
      ? toChecksumAddress(privateToAddress(privateKey).toString("hex"))
      : "";
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
