import Transport from "@ledgerhq/hw-transport";
import {
  getPublicKey,
  getSolanaDerivationPath,
  getDelegateTransaction,
  signTransaction,
} from "./hw";
import { BIP44, RawTx } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    const response = await getPublicKey(
      transport,
      getSolanaDerivationPath(path.account, path.index)
    );
    return response.toBase58();
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    const transaction = await getDelegateTransaction(
      transport,
      getSolanaDerivationPath(path.account, path.index),
      rawTx
    );
    const response = await signTransaction(
      transport,
      transaction,
      getSolanaDerivationPath(path.account, path.index)
    );
    return {
      signatures: {
        signature: response,
        publicKey: rawTx.accountPubkey,
      },
      rawTransaction: rawTx,
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
