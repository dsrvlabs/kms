import { BIP32Interface } from "bip32";
import * as secp256k1 from "secp256k1";
import { enc, SHA256 } from "crypto-js";
import {
  Secp256k1Wallet,
  AminoMsg,
  StdFee,
  pubkeyToAddress,
  makeSignDoc as aMakeSignDoc,
} from "@cosmjs/amino";
import { Account, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getAccount(node: BIP32Interface, prefix: string): Account {
    const address = pubkeyToAddress(
      {
        type: "tendermint/PubKeySecp256k1",
        value: node.publicKey.toString("base64"),
      },
      prefix
    );
    return { address, publicKey: node.publicKey.toString("base64") };
  }

  static async signTx(
    node: BIP32Interface,
    prefix: string,
    rawTx: RawTx
  ): Promise<SignedTx> {
    if (node.privateKey) {
      const wallet = await Secp256k1Wallet.fromKey(
        new Uint8Array(node.privateKey),
        prefix
      );
      const signDoc = aMakeSignDoc(
        rawTx.msgs as AminoMsg[],
        rawTx.fee as StdFee,
        rawTx.chain_id,
        rawTx.memo,
        rawTx.account_number,
        rawTx.sequence
      );

      const account = KEYSTORE.getAccount(node, prefix);
      const response = await wallet.signAmino(account.address, signDoc);
      const signature = new Uint8Array(
        Buffer.from(response.signature.signature, "base64")
      );
      return { rawTx, signedTx: { signature } };
    }
    return { rawTx };
  }

  static async signMessage(node: BIP32Interface, _prefix: string, msg: string) {
    if (node.privateKey) {
      const signature = secp256k1.ecdsaSign(
        Buffer.from(enc.Base64.stringify(SHA256(msg)), "base64"),
        node.privateKey
      );
      return { msg, signedMsg: { ...signature } };
    }
    return { msg };
  }
}
