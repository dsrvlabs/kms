import { encode } from "bs58";
import nacl from "tweetnacl";
import { derivePath } from "near-hd-key";
import sha256 from "js-sha256";
import BN from "bn.js";
import { transactions, utils } from "near-api-js";
import { BIP44, RawTx } from "../../types";

export class KEYSTORE {
  private static getPrivateKey(seed: Buffer, path: BIP44): string {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/0'/${path.index}'`,
      seed.toString("hex")
    );
    const keyPair = nacl.sign.keyPair.fromSeed(key);
    return `${encode(Buffer.from(keyPair.secretKey))}`;
  }

  // eslint-disable-next-line camelcase
  private static getKeyPair(seed: Buffer, path: BIP44): utils.key_pair.KeyPair {
    const privateKey = KEYSTORE.getPrivateKey(seed, path);
    const keyPair = utils.key_pair.KeyPairEd25519.fromString(privateKey);
    return keyPair;
  }

  static getAccount(seed: Buffer, path: BIP44): string {
    const keyPair = KEYSTORE.getKeyPair(seed, path);
    return `${keyPair.getPublicKey()}`;
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
        const action = KEYSTORE.createInstruction(rawTx.ixs[i]);
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
    seed: Buffer,
    path: BIP44,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    const transaction = KEYSTORE.createTransaction(rawTx);
    const serializedTx = utils.serialize.serialize(
      transactions.SCHEMA,
      transaction
    );
    const serializedTxHash = new Uint8Array(sha256.sha256.array(serializedTx));
    const keyPair = KEYSTORE.getKeyPair(seed, path);
    const signature = keyPair.sign(serializedTxHash);
    const signedTransaction = new transactions.SignedTransaction({
      transaction,
      signature: new transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature.signature,
      }),
    });
    return {
      signedTx: signedTransaction,
    };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
