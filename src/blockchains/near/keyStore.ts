import { encode, decode } from "bs58";
import nacl from "tweetnacl";
import { derivePath } from "near-hd-key";
import sha256 from "js-sha256";
import { utils, transactions } from "near-api-js";
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
    const byte = Buffer.from(rawTx.serializedTx, "base64");
    const hashTx = sha256.sha256.array(byte);
    const { signature } = keyPair.sign(new Uint8Array(hashTx));

    const transaction = transactions.Transaction.decode(byte);
    const signedTransaction = new transactions.SignedTransaction({
      transaction,
      signature: new transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature,
      }),
    });

    return {
      rawTx,
      hashTx: encode(new Uint8Array(hashTx)),
      signedTx: `0x${Buffer.from(signedTransaction.encode()).toString("hex")}`,
    };
  }

  static signMessage(seed: Buffer | string, msg: string, path?: BIP44) {
    const keyPair = KEYSTORE.getKeyPair(seed, path);
    const hash = sha256.sha256.array(new Uint8Array(Buffer.from(msg)));
    const { signature } = keyPair.sign(new Uint8Array(hash));
    return {
      signature,
      publicKey: keyPair.getPublicKey().toString(),
    };
  }
}
