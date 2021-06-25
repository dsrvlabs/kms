import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Tezos from "@ledgerhq/hw-app-tezos";
import { BIP44 } from "../../types";
// import { RawTx } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(
    path: BIP44,
    transport: TransportWebUSB | TransportNodeHid
  ): Promise<string> {
    const instance = new Tezos(transport as any);
    const response = await instance.getAddress(
      `44'/${path.type}'/${path.account}'/${path.index}'`
    );
    // console.log(response);
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
