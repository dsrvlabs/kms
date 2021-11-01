import { BIP32Interface } from "bip32";
import * as CodaSDK from "@o1labs/client-sdk";
import { Account, RawTx, SignedTx } from "../../types";

const base58check = require("base58check");
const { TxType, Networks } = require("mina-ledger-js");

export class KEYSTORE {
  private static getPrivateKey(node: BIP32Interface): string {
    const privateKey = base58check.encode(
      node.privateKey ? `01${node.privateKey.toString("hex")}` : "",
      "5a"
    );
    return privateKey;
  }

  static getAccount(node: BIP32Interface): Account {
    const privateKey = KEYSTORE.getPrivateKey(node);
    return {
      address: CodaSDK.derivePublicKey(privateKey),
      publicKey: CodaSDK.derivePublicKey(privateKey),
    };
  }

  static signTx(node: BIP32Interface, rawTx: RawTx): SignedTx {
    const privateKey = KEYSTORE.getPrivateKey(node);
    const account = KEYSTORE.getAccount(node);

    if (rawTx.isPayment) {
      const signedPayment = CodaSDK.signPayment(
        {
          from: rawTx.from,
          to: rawTx.to,
          amount: rawTx.amount,
          fee: rawTx.fee,
          nonce: rawTx.nonce,
        },
        {
          privateKey,
          publicKey: account.publicKey,
        }
      );
      return {
        rawTx,
        signedTx: {
          ...signedPayment,
          payload: {
            ...signedPayment.payload,
            txType: TxType.PAYMENT,
            networkId: rawTx.isDevNet ? Networks.DEVNET : Networks.MAINNET,
          },
        },
      };
    }
    const signedStakeDelegation = CodaSDK.signStakeDelegation(
      {
        from: rawTx.from,
        to: rawTx.to,
        fee: rawTx.fee,
        nonce: rawTx.nonce,
      },
      {
        privateKey,
        publicKey: account.publicKey,
      }
    );
    return {
      rawTx,
      signedTx: {
        ...signedStakeDelegation,
        payload: {
          ...signedStakeDelegation.payload,
          txType: TxType.DELEGATION,
          networkId: rawTx.isDevNet ? Networks.DEVNET : Networks.MAINNET,
        },
      },
    };
  }
  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
