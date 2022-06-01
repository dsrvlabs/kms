import Transport from "@ledgerhq/hw-transport";
import base58 from "bs58";
import { Transaction } from "@solana/web3.js";
import { getPublicKey, getSolanaDerivationPath, signTransaction } from "./hw";
import { Account, BIP44, RawTx, SignedTx } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<Account> {
    const response = await getPublicKey(
      transport,
      getSolanaDerivationPath(path.account, path.index)
    );
    return {
      address: response.toBase58(),
      publicKey: response.toBase58(),
    };
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const transaction = Transaction.from(
      Buffer.from(rawTx.serializedTx.replace("0x", ""), "hex")
    );
    const signature = await signTransaction(
      transport,
      transaction,
      getSolanaDerivationPath(path.account, path.index)
    );
    transaction.addSignature(rawTx.feePayer, signature);
    return {
      rawTx,
      hashTx: transaction.signature
        ? base58.encode(Uint8Array.from(transaction.signature))
        : "",
      signedTx: `0x${transaction.serialize().toString("hex")}`,
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
