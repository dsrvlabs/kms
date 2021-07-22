import Transport from "@ledgerhq/hw-transport";
import { encode } from "bs58";
import { transactions, utils } from "near-api-js";
import BN from "bn.js";
import { BIP44, RawTx } from "../../types";

const App = require("near-ledger-js");

export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    transport.setScrambleKey("NEAR");
    const client = await App.createClient(transport);
    const response = await client.getPublicKey(
      `44'/${path.type}'/${path.account}'/0'/${path.index}'`
    );
    return response ? `ed25519:${encode(response)}` : "";
  }

  private static createInstruction(ix: any): transactions.Action {
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
      default:
        break;
    }
    throw new Error("Create instruction error");
  }

  private static createTransaction(rawTx: RawTx): transactions.Transaction {
    try {
      const { signerId } = rawTx;
      const { receiverId } = rawTx;
      const { nonce } = rawTx;
      const { recentBlockHash } = rawTx;
      const publicKey = utils.PublicKey.fromString(rawTx.publicKey);
      const actions: transactions.Action[] = [];
      for (let i = 0; i < rawTx.ixs.length; i += 1) {
        const action = LEDGER.createInstruction(rawTx.ixs[i]);
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

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    const client = await App.createClient(transport);
    const PATH = `44'/${path.type}'/${path.account}'/0'/${path.index}'`;
    const transaction = LEDGER.createTransaction(rawTx);
    const response = await client.sign(transaction.encode(), PATH);
    const signature = new Uint8Array(response);
    const signedTransaction = new transactions.SignedTransaction({
      transaction,
      signature: new transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature,
      }),
    });
    return {
      signedTx: signedTransaction,
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
