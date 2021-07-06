import { encode } from "bs58";
import nacl from "tweetnacl";
import { derivePath } from "near-hd-key";
import * as nearAPI from "near-api-js";
import sha256 from "js-sha256";
import BN from "bn.js";
import { BIP44, RawTx } from "../../types";

export class KEYSTORE {
  private static getPrivateKey(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const keyPair = nacl.sign.keyPair.fromSeed(key);
    return `${encode(Buffer.from(keyPair.secretKey))}`;
  }

  static getAccount(seed: Buffer, path: BIP44): string {
    const privateKey = KEYSTORE.getPrivateKey(seed, path);
    const keyPair =
      nearAPI.utils.key_pair.KeyPairEd25519.fromString(privateKey);
    return `${keyPair.getPublicKey()}`;
  }

  static async signTx(
    seed: Buffer,
    path: BIP44,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    const privateKey = KEYSTORE.getPrivateKey(seed, path);
    const keyPair =
      nearAPI.utils.key_pair.KeyPairEd25519.fromString(privateKey);
    const publicKey = keyPair.getPublicKey();
    const { sender } = rawTx;
    const { receiver } = rawTx;
    const amount = nearAPI.utils.format.parseNearAmount(rawTx.amount);
    if (!amount) {
      throw new Error("Type 'null' is not assignable to amount");
    }
    const { accessKey } = rawTx;
    const nonce = accessKey.nonce + 1;
    let actions = [nearAPI.transactions.transfer(new BN(amount))];
    if (rawTx.isStake) {
      const validator = nearAPI.utils.PublicKey.fromString(rawTx.validator);
      actions = [nearAPI.transactions.stake(new BN(amount), validator)];
    }
    const recentBlockHash = nearAPI.utils.serialize.base_decode(
      accessKey.block_hash
    );
    const transaction = nearAPI.transactions.createTransaction(
      sender,
      publicKey,
      receiver,
      nonce,
      actions,
      recentBlockHash
    );
    const serializedTx = nearAPI.utils.serialize.serialize(
      nearAPI.transactions.SCHEMA,
      transaction
    );
    const serializedTxHash = new Uint8Array(sha256.sha256.array(serializedTx));
    const signature = keyPair.sign(serializedTxHash);
    const signedTransaction = new nearAPI.transactions.SignedTransaction({
      transaction,
      signature: new nearAPI.transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature.signature,
      }),
    });
    return signedTransaction;
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
