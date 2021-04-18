import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { BIP44 } from "../../types";

const { MinaLedgerJS } = require("mina-ledger-js");

// LEDGER
export class LEDGER {
  static async getAccount(
    path: BIP44,
    transport: TransportWebUSB
  ): Promise<string> {
    const instance = new MinaLedgerJS(transport);
    const response = await instance.getAddress(path.account);
    return response.publicKey;
  }
  /*
  export function signTx(
    path: BIP44,
    transport: TransportWebUSB,
    rawTx: any) {
    // ...
  }
  export function signMessage(
    path: BIP44,
    transport: TransportWebUSB,
    msg: string) {
    // ...
  }
  */
}
