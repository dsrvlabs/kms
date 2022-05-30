import { encode, decode } from "bs58";
import nacl from "tweetnacl";
import { derivePath } from "near-hd-key";
import sha256 from "js-sha256";
import { utils } from "near-api-js";
import { Account, BIP44, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getPrivateKey(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const keyPair = nacl.sign.keyPair.fromSeed(key);
    return `${encode(Buffer.from(keyPair.secretKey))}`;
  }

  private static getKeyPair(
    seed: Buffer | string,
    path?: BIP44
    // eslint-disable-next-line camelcase
  ): utils.key_pair.KeyPair {
    const temp = typeof seed === "string" ? decode(seed) : seed;
    const secretKey = path ? KEYSTORE.getPrivateKey(temp, path) : encode(temp);
    const keyPair = utils.key_pair.KeyPairEd25519.fromString(secretKey);
    return keyPair;
  }

  static getAccount(seed: Buffer | string, path?: BIP44): Account {
    const keyPair = KEYSTORE.getKeyPair(seed, path);
    return {
      address: keyPair.getPublicKey().toString(),
      publicKey: keyPair.getPublicKey().toString(),
    };
  }

  static signTx(seed: Buffer | string, rawTx: RawTx, path?: BIP44): SignedTx {
    const keyPair = KEYSTORE.getKeyPair(seed, path);
    const { signature } = keyPair.sign(
      new Uint8Array(
        sha256.sha256.array(Buffer.from(rawTx.serializedTx, "hex"))
      )
    );

    return {
      rawTx,
      signedTx: { signature },
    };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
