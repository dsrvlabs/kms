import { BIP32Interface } from "bip32";
import CryptoJS from "crypto-js";
import { bech32 } from "bech32";
// import { RawTx } from "../../types";

export class KEYSTORE {
  static bech32ify(address: string, prefix: string) {
    const words = bech32.toWords(Buffer.from(address, "hex"));
    return bech32.encode(prefix, words);
  }

  static getAccount(node: BIP32Interface): string {
    const message = CryptoJS.enc.Hex.parse(node.publicKey.toString("hex"));
    const temp = CryptoJS.RIPEMD160(CryptoJS.SHA256(message) as any).toString();
    const address = this.bech32ify(temp, "terra");
    return address;
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
