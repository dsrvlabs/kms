import { BIP32Interface } from "bip32";
import * as CodaSDK from "@o1labs/client-sdk";
import { RawTx } from "../../types";

const base58check = require("base58check");

export class KEYSTORE {
  private static getPrivateKey(node: BIP32Interface): string {
    const privateKey = base58check.encode(
      node.privateKey ? `01${node.privateKey.toString("hex")}` : "",
      "5a"
    );
    return privateKey;
  }

  static getAccount(node: BIP32Interface): string {
    const privateKey = KEYSTORE.getPrivateKey(node);
    return CodaSDK.derivePublicKey(privateKey);
  }

  static signTx(node: BIP32Interface, rawTx: RawTx): { [key: string]: any } {
    const privateKey = KEYSTORE.getPrivateKey(node);
    const publicKey = KEYSTORE.getAccount(node);

    if (rawTx.meta.isPayment) {
      const signedPayment = CodaSDK.signPayment(
        {
          from: rawTx.meta.from,
          to: rawTx.meta.to,
          amount: rawTx.meta.amount,
          fee: rawTx.meta.fee,
          nonce: rawTx.meta.nonce,
        },
        {
          privateKey,
          publicKey,
        }
      );
      return signedPayment;
    }
    const signedStakeDelegation = CodaSDK.signStakeDelegation(
      {
        from: rawTx.meta.from,
        to: rawTx.meta.to,
        fee: rawTx.meta.fee,
        nonce: rawTx.meta.nonce,
      },
      {
        privateKey,
        publicKey,
      }
    );
    return signedStakeDelegation;
  }
  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
