import { BIP32Interface } from "bip32";
import * as secp256k1 from "secp256k1";
import { enc, SHA256 } from "crypto-js";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import {
  DirectSecp256k1Wallet,
  makeSignDoc,
  makeAuthInfoBytes,
  encodePubkey,
} from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { registry } from "./utils/defaultRegistryTypes";
import { Account, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static async getAccount(
    node: BIP32Interface | string,
    prefix: string
  ): Promise<Account> {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");

    if (privateKey) {
      const wallet = await DirectSecp256k1Wallet.fromKey(
        new Uint8Array(privateKey),
        prefix
      );

      const account = await wallet.getAccounts();
      return {
        address: account[0].address,
        publicKey: Buffer.from(account[0].pubkey).toString("base64"),
      };
    }
    return {
      address: "",
      publicKey: "",
    };
  }

  static async signTx(
    node: BIP32Interface | string,
    prefix: string,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");

    if (privateKey) {
      const wallet = await DirectSecp256k1Wallet.fromKey(
        new Uint8Array(privateKey),
        prefix
      );
      const accounts = await wallet.getAccounts();

      const txBodyEncodeObject = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: {
          messages: rawTx.msgs,
          memo: rawTx.memo,
        },
      };

      const txBodyBytes = registry.encode(txBodyEncodeObject);
      const pubkey = encodePubkey(encodeSecp256k1Pubkey(accounts[0].pubkey));

      const signDoc = makeSignDoc(
        txBodyBytes,
        makeAuthInfoBytes(
          [
            {
              pubkey,
              sequence: rawTx.signerData.sequence,
            },
          ],
          rawTx.fee.amount,
          rawTx.fee.gas
        ),
        rawTx.signerData.chainId,
        rawTx.signerData.accountNumber
      );

      const { signature } = await wallet.signDirect(
        accounts[0].address,
        signDoc
      );

      const txRaw = TxRaw.fromPartial({
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        signatures: [
          new Uint8Array(Buffer.from(signature.signature, "base64")),
        ],
      });

      return { rawTx, signedTx: { txRaw } };
    }
    return { rawTx };
  }

  static async signMessage(
    node: BIP32Interface | string,
    _prefix: string,
    msg: string
  ) {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");

    if (privateKey) {
      const signature = secp256k1.ecdsaSign(
        Buffer.from(enc.Base64.stringify(SHA256(msg)), "base64"),
        privateKey
      );
      return { msg, signedMsg: { ...signature } };
    }
    return { msg };
  }
}
