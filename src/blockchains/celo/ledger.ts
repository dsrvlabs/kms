import Transport from "@ledgerhq/hw-transport";
import Ledger from "@ledgerhq/hw-app-eth";
import { BIP44, RawTx, SignedTx } from "../../types";

import { serializeCeloTransaction } from "@celo-tools/celo-ethers-wrapper/build/main/lib/transactions";

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
    const encodedTx = serializeCeloTransaction(rawTx).slice(2);
    const result = await ledger.signTransaction(
      `44'/${path.type}'/${path.account}'/0/${path.index}`,
      encodedTx
    );

    let addToV = rawTx.chainId * 2 + 35;
    const rv = parseInt(result.v, 16);
    if (rv !== addToV && (rv & addToV) !== rv) {
      addToV += 1;
    }
    result.v = addToV.toString(10);

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
