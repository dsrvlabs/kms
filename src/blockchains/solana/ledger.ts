import Transport from "@ledgerhq/hw-transport";
import { getPublicKey, getSolanaDerivationPath } from "./hw";
import { BIP44 } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    const response = await getPublicKey(
      transport,
      getSolanaDerivationPath(path.account, path.index)
    );
    return response.toBase58();
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
