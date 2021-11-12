import { BIP32Interface } from "bip32";
import * as secp256k1 from "secp256k1";
import { enc, SHA256 } from "crypto-js";
import { pubkeyToAddress, encodeSecp256k1Pubkey } from "@cosmjs/amino";
import {
  DirectSecp256k1Wallet,
  makeSignDoc,
  makeAuthInfoBytes,
  encodePubkey,
} from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { registry } from "./defaultRegistryTypes";
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
      const wallet = await DirectSecp256k1Wallet.fromKey(
        new Uint8Array(node.privateKey),
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
