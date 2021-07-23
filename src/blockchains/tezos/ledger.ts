import Transport from "@ledgerhq/hw-transport";
import Tezos from "@ledgerhq/hw-app-tezos";
import { BIP44 } from "../../types";
// import { RawTx, SignedTx } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
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
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
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
