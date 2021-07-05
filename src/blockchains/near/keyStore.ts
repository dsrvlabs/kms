import { encode } from "bs58";
import nacl from "tweetnacl";
import { derivePath } from "near-hd-key";
import { BIP44, RawTx } from "../../types";

const nearAPI = require("near-api-js");
const sha256 = require('js-sha256');

export class KEYSTORE {
  private static getPrivateKey(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const keyPair = nacl.sign.keyPair.fromSeed(key);
    return `${encode(Buffer.from(keyPair.secretKey))}`
  }
  
  static getAccount(seed: Buffer, path: BIP44): string {
    const privateKey = KEYSTORE.getPrivateKey(seed, path);
    const keyPair = nearAPI.utils.key_pair.KeyPairEd25519.fromString(privateKey);
    return `${keyPair.publicKey}`;
  }

  static async signTx(seed: Buffer, path: BIP44, rawTx: RawTx) {
    const privateKey = KEYSTORE.getPrivateKey(seed, path);
    const sender = rawTx.sender;
    const receiver = rawTx.receiver;
    const amount = nearAPI.utils.format.parseNearAmount(rawTx.amount);
    const keyPair = nearAPI.utils.key_pair.KeyPairEd25519.fromString(privateKey);
    const publicKey = keyPair.getPublicKey();
    const accessKey = rawTx.accessKey;
    if(accessKey.permission !== 'FullAccess') {
      return console.log(
        `Account [ ${sender} ] does not have permission to send tokens using key: [ ${publicKey} ]`
      );
    }
    const nonce = ++accessKey.nonce;
    var actions = [nearAPI.transactions.transfer(amount)];
    if (rawTx.isStake) {
      const validator = await nearAPI.utils.PublicKey.fromString(rawTx.validator);
      actions = [nearAPI.transactions.stake(amount, validator)];
    }
    const recentBlockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);
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
        data: signature.signature 
        })
    });
    const verify = keyPair.verify(serializedTxHash, signature.signature);
    if (rawTx.isStake) {
      return {
        ...signedTransaction,
        verifyStakeSignature: verify,
      }
    }
      return {
        ...signedTransaction,
        verifyTransferSignature: verify,
      };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
