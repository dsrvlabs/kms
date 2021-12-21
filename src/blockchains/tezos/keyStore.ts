import nacl from "tweetnacl";
import { derivePath } from "near-hd-key";
import { Account, BIP44 } from "../../types";
import { encodeAddress } from "./hw";

// import { RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getAccount(seed: Buffer, path: BIP44): Account {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/${path.index}'`,
      seed.toString("hex")
    );
    const keyPair = nacl.sign.keyPair.fromSeed(key);
    return {
      address: encodeAddress(Buffer.from(keyPair.publicKey)),
      publicKey: Buffer.from(keyPair.publicKey).toString("hex"),
    };
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
