import Transport from "@ledgerhq/hw-transport";
import { BIP44 } from "../../types";

const FlowApp = require("@onflow/ledger").default;

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    const instance = new FlowApp(transport);
    const response = await instance.getAddressAndPubKey(
      `m/44'/1'/${path.type}/0/${path.index}`
    );
    return response.address;
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
