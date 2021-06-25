import { encode } from "bs58";
import nacl from "tweetnacl";
import { derivePath } from "near-hd-key";
import { BIP44, RawTx } from "../../types";

const nearAPI = require("near-api-js");
const sha256 = require('js-sha256');

export class KEYSTORE {
  static getAccount(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const keyPair = nacl.sign.keyPair.fromSeed(key);
    return `ed25519:${encode(Buffer.from(keyPair.publicKey))}`;
  }

  private static getPrivateKey(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const keyPair = nacl.sign.keyPair.fromSeed(key);
    return `${encode(Buffer.from(keyPair.secretKey))}`
  }

  static async signTx(seed: Buffer, path: BIP44, rawTx: RawTx) {
    const privateKey = KEYSTORE.getPrivateKey(seed, path);
    const sender = rawTx.sender;
    const receiver = rawTx.receiver;
    const networkId = rawTx.networkId;
    const amount = nearAPI.utils.format.parseNearAmount(rawTx.amount);
    const provider = new nearAPI.providers
        .JsonRpcProvider(`https://rpc.${networkId}.near.org`);
    
    const keyPair = nearAPI.utils.key_pair.KeyPairEd25519.fromString(privateKey);
    const publicKey = keyPair.getPublicKey();
    const accessKey = await provider.query(
        `access_key/${sender}/${publicKey.toString()}`, ''
    );
    const nonce = ++accessKey.nonce;
    const actions = [nearAPI.transactions.transfer(amount)];
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

    /* send transaction
    const signedSerializedTx = signedTransaction.encode();
    const result = await provider.sendJsonRpc(
      'broadcast_tx_commit', 
      [Buffer.from(signedSerializedTx).toString('base64')]
    );

    return result.transaction
    */

    return signedTransaction
  }


  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
