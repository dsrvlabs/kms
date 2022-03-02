import { Transaction } from "@solana/web3.js";
import { RawTx } from "../../types";

export function createTransaction(rawTx: RawTx): Transaction {
  const transaction = new Transaction({
    recentBlockhash: rawTx.recentBlockhash,
    feePayer: rawTx.feePayer,
  });
  (rawTx.txs as any[]).forEach((tx: any) => {
    if (tx.instructions) {
      (tx.instructions as any[]).forEach((tx2) => {
        transaction.add({ ...tx2, data: Buffer.from(tx2.data) });
      });
    } else {
      transaction.add({ ...tx, data: Buffer.from(tx.data) });
    }
  });
  return transaction;
}
