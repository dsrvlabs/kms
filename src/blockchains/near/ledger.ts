import Transport from "@ledgerhq/hw-transport";
import { encode } from "bs58";
import { Account, BIP44, RawTx, SignedTx } from "../../types";

const App = require("near-ledger-js");

export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<Account> {
    transport.setScrambleKey("NEAR");
    const client = await App.createClient(transport);
    const response = await client.getPublicKey(
      `44'/${path.type}'/${path.account}'/0'/${path.index}'`
    );
    return {
      address: `ed25519:${encode(response)}`,
      publicKey: `ed25519:${encode(response)}`,
    };
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const client = await App.createClient(transport);
    const PATH = `44'/${path.type}'/${path.account}'/0'/${path.index}'`;
    const response = await client.sign(
      Buffer.from(rawTx.serializedTx, "hex"),
      PATH
    );

    return {
      rawTx,
      signedTx: { signature: new Uint8Array(response) },
    };
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
