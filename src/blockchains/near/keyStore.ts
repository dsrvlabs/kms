import { BIP32Interface } from "bip32";
import { encode } from "bs58";
import { KeyPair } from "near-api-js";
import nacl from "tweetnacl";

export class KEYSTORE {
  static getAccount(node: BIP32Interface): string {
    const pk = node.privateKey
      ? new Uint8Array(node.privateKey.buffer)
      : new Uint8Array(32);
    const { secretKey } = nacl.sign.keyPair.fromSeed(pk);
    const keyPair = KeyPair.fromString(`ed25519:${encode(secretKey)}`);
    return encode(keyPair.getPublicKey().data);
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
