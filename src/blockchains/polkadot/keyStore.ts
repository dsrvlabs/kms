import { derivePath } from "near-hd-key";
import { naclKeypairFromSeed, encodeAddress } from "@polkadot/util-crypto";
import { Account, BIP44 } from "../../types";

export class KEYSTORE {
  static getAccount(seed: Buffer, path: BIP44): Account {
    const ss58Format = 0;
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const account = naclKeypairFromSeed(key);
    return {
      address: encodeAddress(
        `0x${Buffer.from(account.publicKey).toString("hex")}`,
        ss58Format
      ),
      publicKey: `0x${Buffer.from(account.publicKey).toString("hex")}`,
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
