import Transport from "@ledgerhq/hw-transport";
import Ledger from "./hw";
import { BIP44 } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    try {
      const instance = new Ledger(transport);
      const response = await instance.getAddress(
        `44'/${path.type}'/${path.account}'/0/${path.index}`
      );
      return response.address;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    return "";
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
