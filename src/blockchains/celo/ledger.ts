import Transport from "@ledgerhq/hw-transport";
import Ledger from "./hw";
import { BIP44, RawTx, SignedTx } from "../../types";

import { serializeCeloTransaction } from "@celo-tools/celo-ethers-wrapper/build/main/lib/transactions";
// import { inputCeloTxFormatter } from "@celo/connect/lib/utils/formatter";
// import { utils } from "ethers";
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

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const ledger = new Ledger(transport);
    console.log("rawTx: ", rawTx);

    const encodedTx = serializeCeloTransaction(rawTx).slice(2);
    // console.log("keccak256: ", serializeCeloTransaction(rawTx));
    console.log("encodedTx: ", encodedTx);
    const result = await ledger.signTransaction(
      `44'/${path.type}'/${path.account}'/0/${path.index}`,
      encodedTx
    );
    console.log(result);
    return {
      rawTx,
      signedTx: result,
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
