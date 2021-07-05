import Transport from "@ledgerhq/hw-transport";
import { encode } from "bs58";
import { BIP44, RawTx } from "../../types";

const App = require("near-ledger-js");
const nearAPI = require("near-api-js");

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
  ): Promise<any> {
    const client = await App.createClient(transport);
    const rawPublicKey = await client.getPublicKey(`44'/${path.type}'/${path.account}'/0'/${path.index}'`);
    const publicKey = new nearAPI.utils.PublicKey({
      keyType: nearAPI.utils.key_pair.KeyType.ED25519,
      data: rawPublicKey,
    }); 
    const sender = rawTx.sender;
    const receiver = rawTx.receiver;
    const amount = nearAPI.utils.format.parseNearAmount(rawTx.amount);
    const provider = new nearAPI.providers.JsonRpcProvider(rawTx.provider);
    const accessKey = await provider.query(rawTx.accessKey, '');
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
    const response = await client.sign(
      transaction.encode(), `44'/${path.type}'/${path.account}'/0'/${path.index}'`
    );
    return response    
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
