import BN from "bn.js";
import { transactions, utils } from "near-api-js";
import { RawTx } from "../../types";

function createInstruction(ix: any): transactions.Action {
  if (typeof ix.transactionType !== "number") {
    throw new Error("Instruction has no transaction type");
  }
  switch (ix.transactionType) {
    case 0: {
      // transfer
      const amount = utils.format.parseNearAmount(ix.amount);
      if (!amount) {
        throw new Error("Type 'null' is not assignable to amount");
      }
      return transactions.transfer(new BN(amount));
    }
    case 1: {
      // deposit_and_stake
      if (!ix.amount) {
        throw new Error("Amount is required");
      }
      if (!ix.gas) {
        throw new Error("Gas is required");
      }
      const amount = utils.format.parseNearAmount(ix.amount);
      if (!amount) {
        throw new Error("Type 'null' is not assignable to amount");
      }
      const { gas } = ix;
      return transactions.functionCall(
        "deposit_and_stake",
        new Uint8Array(),
        new BN(gas),
        new BN(amount)
      );
    }
    case 2: {
      // unstake
      if (!ix.amount) {
        throw new Error("Amount is required");
      }
      if (!ix.gas) {
        throw new Error("Gas is required");
      }
      const amount = utils.format.parseNearAmount(ix.amount);
      if (!amount) {
        throw new Error("Type 'null' is not assignable to amount");
      }
      const { gas } = ix;
      return transactions.functionCall(
        "unstake",
        Buffer.from(`{"amount": "${amount}"}`),
        new BN(gas),
        new BN(0)
      );
    }
    case 3: {
      // unstake_all
      if (!ix.gas) {
        throw new Error("Gas is required");
      }
      const { gas } = ix;
      return transactions.functionCall(
        "unstake_all",
        new Uint8Array(),
        new BN(gas),
        new BN(0)
      );
    }
    default:
      break;
  }
  throw new Error("Create instruction error");
}

export function createTransaction(rawTx: RawTx): transactions.Transaction {
  try {
    const { signerId } = rawTx;
    const { receiverId } = rawTx;
    const { nonce } = rawTx;
    const { recentBlockHash } = rawTx;
    const publicKey = utils.PublicKey.fromString(rawTx.encodedPubKey);
    const actions: transactions.Action[] = [];
    for (let i = 0; i < rawTx.ixs.length; i += 1) {
      const action = createInstruction(rawTx.ixs[i]);
      actions.push(action);
      if (actions == null) {
        throw new Error("No actions provided");
      }
    }
    const transaction = transactions.createTransaction(
      signerId,
      publicKey,
      receiverId,
      nonce,
      actions,
      recentBlockHash
    );
    return transaction;
  } catch (error) {
    throw new Error(error);
  }
}
