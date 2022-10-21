import { BIP32Interface } from "bip32";
import * as secp256k1 from "secp256k1";
import { isHexString, privateToAddress } from "ethereumjs-util";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { bech32 } from "bech32";
import { Account, Message, SignedTx } from "../../types";
import { cosmosSignTx, signCosmos, signInject } from "./signTx/cosmos";

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
      if (prefix === "inj") {
        return {
          address: bech32.encode(
            prefix,
            bech32.toWords(privateToAddress(privateKey))
          ),
          publicKey: Buffer.from(
            secp256k1.publicKeyCreate(privateKey, true)
          ).toString("base64"),
        };
      }

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
    unsignedTx: string
  ): Promise<SignedTx> {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");
    const parsedTx = isHexString(unsignedTx)
      ? unsignedTx
      : JSON.parse(unsignedTx);
    if (privateKey) {
      return cosmosSignTx(privateKey, prefix, parsedTx);
    }
    return {};
  }

  static async signMessage(
    node: BIP32Interface | string,
    prefix: string,
    msg: Message
  ) {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");

    if (privateKey) {
      const message = isHexString(msg.data)
        ? Buffer.from(msg.data.replace("0x", ""), "hex")
        : Buffer.from(msg.data, "utf8");
      const signature =
        prefix === "inj"
          ? signInject(message, privateKey)
          : signCosmos(message, privateKey);
      return {
        msg,
        signedMsg: { ...signature },
      };
    }
    return { msg };
  }
}
