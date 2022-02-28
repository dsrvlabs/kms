import { BN } from "bn.js";
import { transactions, utils } from "near-api-js";
import { RawTx } from "../../types";

export function createTransaction(rawTx: RawTx): transactions.Transaction {
  const { signerId } = rawTx;
  const { receiverId } = rawTx;
  const { nonce } = rawTx;
  const { recentBlockHash } = rawTx;
  const publicKey = utils.PublicKey.fromString(rawTx.encodedPubKey);

  const actions: transactions.Action[] = [];

  (rawTx.txs as any[]).forEach((tx: any) => {
    const parsed = JSON.parse(tx);
    switch (parsed.enum) {
      case "transfer":
        actions.push(
          transactions.transfer(new BN(parsed.transfer.deposit, "hex"))
        );
        break;
      case "functionCall":
        {
          const args =
            Object.keys(parsed.functionCall.args).length === 0
              ? new Uint8Array()
              : parsed.functionCall.args;
          actions.push(
            transactions.functionCall(
              parsed.functionCall.methodName,
              args,
              new BN(parsed.functionCall.gas, "hex"),
              new BN(parsed.functionCall.deposit, "hex")
            )
          );
        }
        break;
      default:
        break;
    }
  });

  const transaction = transactions.createTransaction(
    signerId,
    publicKey,
    receiverId,
    nonce,
    actions,
    recentBlockHash
  );
  return transaction;
}
