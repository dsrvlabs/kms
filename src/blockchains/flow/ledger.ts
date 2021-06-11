import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { BIP44 } from "../../types";

const FlowApp = require("@onflow/ledger").default;

// LEDGER
export class LEDGER {
  static async getAccount(
    path: BIP44,
    transport: TransportWebUSB | TransportNodeHid
  ): Promise<string> {
    const instance = new FlowApp(transport);
    const response = await instance.getAddressAndPubKey(
      `m/44'/1'/${path.type}/0/${path.index}`
    );
    return response.address;
  }

  /*
  static async signTx(
    path: BIP44,
    transport: TransportWebUSB | TransportNodeHid,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    // ...
  }

  export function signMessage(
    path: BIP44,
    transport: TransportWebUSB | TransportNodeHid,
    msg: string) {
    // ...
  }
  */
}
