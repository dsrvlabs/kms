import Transport from "@ledgerhq/hw-transport";
import { serializeCeloTransaction } from "./transactions";
import Ledger from "./hw";
import { BIP44, RawTx, SignedTx } from "../../types";

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
    const encodedTx = serializeCeloTransaction(rawTx).slice(2);
    const signature = await ledger.signTransaction(
      `44'/${path.type}'/${path.account}'/0/${path.index}`,
      encodedTx
    );

    let addToV = rawTx.chainId * 2 + 35;
    const rv = parseInt(signature.v, 16);
    // eslint-disable-next-line no-bitwise
    if (rv !== addToV && (rv & addToV) !== rv) {
      addToV += 1;
    }
    signature.v = addToV.toString(10);

    return {
      rawTx,
      signedTx: {
        signature: {
          ...signature,
          r: `0x${signature.r}`,
          s: `0x${signature.s}`,
        },
      },
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
