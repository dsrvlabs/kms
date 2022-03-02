import { PublicKey, Transaction } from "@solana/web3.js";
import { RawTx } from "../../types";

export function createTransaction(rawTx: RawTx): Transaction {
  const transaction = new Transaction({
    recentBlockhash: rawTx.recentBlockhash,
    feePayer:
      typeof rawTx.feePayer === "string"
        ? new PublicKey(rawTx.feePayer)
        : rawTx.feePayer,
  });
  (rawTx.txs as any[]).forEach((tx: any) => {
    if (tx.instructions) {
      (tx.instructions as any[]).forEach((tx2) => {
        const keys = (tx2.keys as any[]).map((key) => {
          return {
            ...key,
            pubkey:
              typeof key.pubkey === "string"
                ? new PublicKey(key.pubkey)
                : key.pubkey,
          };
        });
        transaction.add({ ...tx2, keys, data: Buffer.from(tx2.data) });
      });
    } else {
      const keys = (tx.keys as any[]).map((key) => {
        return {
          ...key,
          pubkey:
            typeof key.pubkey === "string"
              ? new PublicKey(key.pubkey)
              : key.pubkey,
        };
      });
      transaction.add({ ...tx, keys, data: Buffer.from(tx.data) });
    }
  });
  return transaction;
}
