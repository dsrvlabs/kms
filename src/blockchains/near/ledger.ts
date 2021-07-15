import Transport from "@ledgerhq/hw-transport";
import { encode } from "bs58";
import * as nearAPI from "near-api-js";
import BN from "bn.js";
import { BIP44, RawTx } from "../../types";

const App = require("near-ledger-js");

export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    transport.setScrambleKey("NEAR");
    const client = await App.createClient(transport);
    const response = await client.getPublicKey(
      `44'/${path.type}'/${path.account}'/0'/${path.index}'`
    );
    return response ? `ed25519:${encode(response)}` : "";
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    const client = await App.createClient(transport);
    const PATH = `44'/${path.type}'/${path.account}'/0'/${path.index}'`;
    const rawPublicKey = await client.getPublicKey(PATH);
    const publicKey = new nearAPI.utils.PublicKey({
      keyType: nearAPI.utils.key_pair.KeyType.ED25519,
      data: new Uint8Array(rawPublicKey),
    });
    const { sender } = rawTx;
    const { receiver } = rawTx;
    const amount = nearAPI.utils.format.parseNearAmount(rawTx.amount);
    if (!amount) {
      throw new Error("Type 'null' is not assignable to amount");
    }
    const { accessKey } = rawTx;
    const nonce = accessKey.nonce + 1;
    const { gas } = rawTx;
    let actions = [nearAPI.transactions.transfer(new BN(amount))];
    if (rawTx.isStake) {
      actions = [
        nearAPI.transactions.functionCall(
          "deposit_and_stake",
          new Uint8Array(),
          new BN(gas),
          new BN(amount)
        ),
      ];
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
    const response = await client.sign(transaction.encode(), PATH);
    const signature = new Uint8Array(response);
    const signedTransaction = new nearAPI.transactions.SignedTransaction({
      transaction,
      signature: new nearAPI.transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature,
      }),
    });
    return signedTransaction;
  }

  /*
  export function signMessage(
    path: BIP44,
    transport: Transport,
    msg: string) {
    // ...
  }
  */
}
