import { BIP32Interface } from "bip32";
import * as secp256k1 from "secp256k1";
import {
  AccessListEIP2930Transaction,
  FeeMarketEIP1559Transaction,
} from "@ethereumjs/tx";
import {
  privateToAddress,
  privateToPublic,
  rlp,
  bnToHex,
  keccak256,
  ecsign,
  BN,
  isHexString,
  fromUtf8,
  toBuffer,
  intToHex,
} from "ethereumjs-util";
import { bech32 } from "bech32";
import { Account, Message, SignedTx } from "../../types";

export class KEYSTORE {
  static getAccount(node: BIP32Interface | string, prefix: string): Account {
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
      return {
        address: `0x${privateToAddress(privateKey).toString("hex")}`,
        publicKey: `0x${Buffer.from(
          secp256k1.publicKeyCreate(privateKey, true)
        ).toString("hex")}`,
      };
    }
    return {
      address: "",
      publicKey: "",
    };
  }

  public static celoRLPEncode(
    parsedTx: any,
    vNum?: number,
    rHex?: string,
    sHex?: string
  ): Buffer {
    return rlp.encode([
      bnToHex(new BN(parsedTx.nonce)),
      bnToHex(new BN(parsedTx.gasPrice)),
      bnToHex(new BN(parsedTx.gasLimit)),
      parsedTx.feeCurrency || "0x",
      parsedTx.gatewayFeeRecipient || "0x",
      parsedTx.gatewayFee ? bnToHex(new BN(parsedTx.gatewayFee)) : "0x",
      parsedTx.to,
      parsedTx.value ? bnToHex(new BN(parsedTx.value)) : "0x",
      parsedTx.data || "0x",
      vNum || bnToHex(new BN(parsedTx.chainId)),
      rHex || "0x",
      sHex || "0x",
    ]);
  }

  private static celoSignTx(privateKey: Buffer, parsedTx: any): SignedTx {
    const rlpEncode = KEYSTORE.celoRLPEncode(parsedTx);
    const sig = ecsign(keccak256(rlpEncode), privateKey);

    const signature = KEYSTORE.celoRLPEncode(
      parsedTx,
      sig.v,
      `0x${sig.r.toString("hex")}`,
      `0x${sig.s.toString("hex")}`
    );

    return {
      hash: `0x${keccak256(signature).toString("hex")}`,
      serializedTx: `0x${signature.toString("hex")}`,
    };
  }

  private static eip155ignTx(privateKey: Buffer, parsedTx: any): SignedTx {
    const rlpEncode = rlp.encode([
      bnToHex(new BN(parsedTx.nonce)),
      bnToHex(new BN(parsedTx.gasPrice)),
      bnToHex(new BN(parsedTx.gasLimit)),
      parsedTx.to,
      parsedTx.value ? bnToHex(new BN(parsedTx.value)) : "0x",
      parsedTx.data || "0x",
      bnToHex(new BN(parsedTx.chainId)),
      "0x",
      "0x",
    ]);
    const sig = ecsign(keccak256(rlpEncode), privateKey);

    const signature = rlp.encode([
      bnToHex(new BN(parsedTx.nonce)),
      bnToHex(new BN(parsedTx.gasPrice)),
      bnToHex(new BN(parsedTx.gasLimit)),
      parsedTx.to,
      parsedTx.value ? bnToHex(new BN(parsedTx.value)) : "0x",
      parsedTx.data || "0x",
      bnToHex(
        new BN(
          27 +
            (sig.v === 0 || sig.v === 1 ? sig.v : 1 - (sig.v % 2)) +
            parseInt(parsedTx.chainId, 10) * 2 +
            8
        )
      ),
      `0x${sig.r.toString("hex")}`,
      `0x${sig.s.toString("hex")}`,
    ]);

    return {
      hash: `0x${keccak256(signature).toString("hex")}`,
      serializedTx: `0x${signature.toString("hex")}`,
    };
  }

  private static eip2930SignTx(privateKey: Buffer, parsedTx: any): SignedTx {
    const tx = AccessListEIP2930Transaction.fromTxData({
      nonce: bnToHex(new BN(parsedTx.nonce)),
      gasPrice: bnToHex(new BN(parsedTx.gasPrice)),
      gasLimit: bnToHex(new BN(parsedTx.gasLimit)),
      to: parsedTx.to,
      value: parsedTx.value ? bnToHex(new BN(parsedTx.value)) : "0x",
      data: parsedTx.data || "0x",
      chainId: bnToHex(new BN(parsedTx.chainId)),
      accessList: parsedTx.accessList ? parsedTx.accessList : [],
    });
    const signedTx = tx.sign(privateKey);
    return {
      hash: `0x${keccak256(signedTx.serialize()).toString("hex")}`,
      serializedTx: `0x${signedTx.serialize().toString("hex")}`,
    };
  }

  private static eip1559SignTx(privateKey: Buffer, parsedTx: any): SignedTx {
    const tx = FeeMarketEIP1559Transaction.fromTxData({
      nonce: bnToHex(new BN(parsedTx.nonce)),
      gasLimit: bnToHex(new BN(parsedTx.gasLimit)),
      to: parsedTx.to,
      value: bnToHex(new BN(parsedTx.value)),
      data: parsedTx.data || "0x",
      chainId: bnToHex(new BN(parsedTx.chainId)),
      accessList: parsedTx.accessList ? parsedTx.accessList : [],
      maxPriorityFeePerGas: parsedTx.maxPriorityFeePerGas
        ? bnToHex(new BN(parsedTx.maxPriorityFeePerGas))
        : "0x",
      maxFeePerGas: parsedTx.maxFeePerGas
        ? bnToHex(new BN(parsedTx.maxFeePerGas))
        : "0x",
    });
    const signedTx = tx.sign(privateKey);
    return {
      hash: `0x${keccak256(signedTx.serialize()).toString("hex")}`,
      serializedTx: `0x${signedTx.serialize().toString("hex")}`,
    };
  }

  private static signInjectiveProtocol(
    privateKey: Buffer,
    unsignedTx: any
  ): SignedTx {
    const sig = ecsign(
      keccak256(Buffer.from(unsignedTx.replace("0x", ""), "hex")),
      privateKey
    );
    return {
      serializedTx: unsignedTx,
      signature: `0x${Buffer.concat([sig.r, sig.s]).toString("hex")}`,
    };
  }

  static signTx(
    node: BIP32Interface | string,
    prefix: string,
    unsignedTx: string
  ): SignedTx {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");

    if (isHexString(unsignedTx) && prefix === "inj" && privateKey) {
      return KEYSTORE.signInjectiveProtocol(privateKey, unsignedTx);
    }

    const parsedTx = JSON.parse(unsignedTx);
    if (privateKey) {
      if (parsedTx.feeCurrency) {
        return KEYSTORE.celoSignTx(privateKey, parsedTx);
      }

      if (parsedTx.maxFeePerGas) {
        return KEYSTORE.eip1559SignTx(privateKey, parsedTx);
      }

      if (parsedTx.accessList) {
        return KEYSTORE.eip2930SignTx(privateKey, parsedTx);
      }

      return KEYSTORE.eip155ignTx(privateKey, parsedTx);
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

    const hexToBytes = (hex: string) => {
      const bytes = [];
      for (let i = 0; i < hex.length; i += 2)
        bytes.push(parseInt(hex.substring(i, i + 2), 16));
      return bytes;
    };
    if (privateKey) {
      if (prefix === "inj") {
        const message = isHexString(msg.data)
          ? Buffer.from(msg.data.replace("0x", ""), "hex")
          : Buffer.from(msg.data, "utf8");
        const { signature } = KEYSTORE.signInjectiveProtocol(
          privateKey,
          message.toString("hex")
        );
        return {
          msg,
          signedMsg: {
            signature,
            publicKey: `0x${privateToPublic(privateKey).toString("hex")}`,
          },
        };
      }
      const msgHex = isHexString(msg.data) ? msg.data : fromUtf8(msg.data);
      const messageBytes = hexToBytes(msgHex.replace("0x", ""));
      const messageBuffer = toBuffer(msgHex);
      let messageHash: Buffer = messageBuffer;
      if (
        !msg.type ||
        msg.type === "eth_sign" ||
        msg.type === "personal_sign"
      ) {
        const preamble = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
        const preambleBuffer = Buffer.from(preamble);
        const ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
        messageHash = keccak256(ethMessage);
      }
      const sig = ecsign(messageHash, privateKey);
      const signature = Buffer.concat([
        sig.r,
        sig.s,
        toBuffer(intToHex(sig.v)),
      ]).toString("hex");

      return {
        msg,
        signedMsg: {
          signature: `0x${signature}`,
          publicKey: `0x${privateToPublic(privateKey).toString("hex")}`,
        },
      };
    }
    return { msg };
  }
}
