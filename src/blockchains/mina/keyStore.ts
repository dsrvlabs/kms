import { BIP32Interface } from "bip32";
import * as CodaSDK from "@o1labs/client-sdk";

const base58check = require("base58check");

export class KEYSTORE {
  static getAccount(node: BIP32Interface): string {
    const privateKey = base58check.encode(
      node.privateKey ? `01${node.privateKey.toString("hex")}` : "",
      "5a"
    );
    return CodaSDK.derivePublicKey(privateKey);
  }
  /*
  export signTx(node: BIP32Interface, rawTx: any) {
    // ...
  }
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
