import Transport from "@ledgerhq/hw-transport";
import { encode } from "bs58";
import { BIP44 } from "../../types";

const App = require("near-ledger-js");

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    transport.setScrambleKey("NEAR");
    const client = await App.createClient(transport);
    const response = await client.getPublicKey(
      `44'/${path.type}'/${path.account}'/0'/${path.index}'`
    );
    return response ? `ed25519:${encode(response)}` : "";
  }

  /*
  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    // ...
  }

  export function signMessage(
    path: BIP44,
    transport: Transport,
    msg: string) {
    // ...
  }
  */
}
