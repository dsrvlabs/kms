import { BIP32Interface } from "bip32";
import {
  AccessListEIP2930Transaction,
  FeeMarketEIP1559Transaction,
} from "@ethereumjs/tx";
import {
  privateToAddress,
  privateToPublic,
  publicToAddress,
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
import { Account, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getAccount(node: BIP32Interface | string): Account {
    if (typeof node !== "string") {
      return {
        address: `0x${publicToAddress(node.publicKey, true).toString("hex")}`,
        publicKey: `0x${node.publicKey.toString("hex")}`,
      };
    }
    return {
      address: `0x${privateToAddress(
        Buffer.from(node.replace("0x", ""), "hex")
      ).toString("hex")}`,
      publicKey: `0x${privateToPublic(
        Buffer.from(node.replace("0x", ""), "hex")
      ).toString("hex")}`,
    };
  }

  private static legacySignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    const rlpEncode = rlp.encode([
      bnToHex(new BN(rawTx.nonce)),
      bnToHex(new BN(rawTx.gasPrice)),
      bnToHex(new BN(rawTx.gasLimit)),
      rawTx.to,
      rawTx.value ? bnToHex(new BN(rawTx.value)) : "0x",
      rawTx.data || "0x",
    ]);
    const rlpDecode = rlp.decode(rlpEncode);
    const sig = ecsign(keccak256(rlpEncode), privateKey);

    const signature = rlp.encode([
      bnToHex(new BN(rawTx.nonce)),
      bnToHex(new BN(rawTx.gasPrice)),
      bnToHex(new BN(rawTx.gasLimit)),
      rawTx.to,
      rawTx.value ? bnToHex(new BN(rawTx.value)) : "0x",
      rawTx.data || "0x",
      sig.v !== 27 ? "0x1c" : "0x1b",
      `0x${sig.r.toString("hex")}`,
      `0x${sig.s.toString("hex")}`,
    ]);

    return {
      rawTx,
      signedTx: {
        json: {
          nonce: `0x${(rlpDecode[0] as any as Buffer).toString("hex")}`,
          gasPrice: `0x${(rlpDecode[1] as any as Buffer).toString("hex")}`,
          gasLimit: `0x${(rlpDecode[2] as any as Buffer).toString("hex")}`,
          to: `0x${(rlpDecode[3] as any as Buffer).toString("hex")}`,
          value: `0x${(rlpDecode[4] as any as Buffer).toString("hex")}`,
          data: `0x${(rlpDecode[5] as any as Buffer).toString("hex")}`,
          v: sig.v,
          r: `0x${sig.r.toString("hex")}`,
          s: `0x${sig.s.toString("hex")}`,
        },
        signature: `0x${signature.toString("hex")}`,
      },
    };
  }

  private static eip2930SignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    const tx = AccessListEIP2930Transaction.fromTxData({
      nonce: bnToHex(new BN(rawTx.nonce)),
      gasPrice: bnToHex(new BN(rawTx.gasPrice)),
      gasLimit: bnToHex(new BN(rawTx.gasLimit)),
      to: rawTx.to,
      value: rawTx.value ? bnToHex(new BN(rawTx.value)) : "0x",
      data: rawTx.data || "0x",
      chainId: bnToHex(new BN(rawTx.chainId)),
    });
    const signedTx = tx.sign(privateKey);
    const json = signedTx.toJSON();
    return {
      rawTx,
      hashTx: `0x${keccak256(signedTx.serialize()).toString("hex")}`,
      signedTx: {
        json: { ...json, v: parseInt(json.v || "0x0", 16) },
        signature: `0x${signedTx.serialize().toString("hex")}`,
      },
    };
  }

  private static eip1559SignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    const tx = FeeMarketEIP1559Transaction.fromTxData({
      nonce: bnToHex(new BN(rawTx.nonce)),
      gasLimit: bnToHex(new BN(rawTx.gasLimit)),
      to: rawTx.to,
      value: bnToHex(new BN(rawTx.value)),
      data: rawTx.data || "0x",
      chainId: bnToHex(new BN(rawTx.chainId)),
      accessList: rawTx.accessList ? rawTx.accessList : [],
      maxPriorityFeePerGas: rawTx.maxPriorityFeePerGas
        ? bnToHex(new BN(rawTx.maxPriorityFeePerGas))
        : "0x",
      maxFeePerGas: rawTx.maxFeePerGas
        ? bnToHex(new BN(rawTx.maxFeePerGas))
        : "0x",
    });
    const signedTx = tx.sign(privateKey);
    const json = signedTx.toJSON();
    return {
      rawTx,
      hashTx: `0x${keccak256(signedTx.serialize()).toString("hex")}`,
      signedTx: {
        json: { ...json, v: parseInt(json.v || "0x0", 16) },
        signature: `0x${signedTx.serialize().toString("hex")}`,
      },
    };
  }

  private static celoSignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    const rlpEncode = rlp.encode([
      bnToHex(new BN(rawTx.nonce)),
      bnToHex(new BN(rawTx.gasPrice)),
      bnToHex(new BN(rawTx.gasLimit)),
      rawTx.feeCurrency || "0x",
      rawTx.gatewayFeeRecipient || "0x",
      rawTx.gatewayFee ? bnToHex(new BN(rawTx.gatewayFee)) : "0x",
      rawTx.to,
      rawTx.value ? bnToHex(new BN(rawTx.value)) : "0x",
      rawTx.data || "0x",
      bnToHex(new BN(rawTx.chainId)),
      "0x",
      "0x",
    ]);
    const rlpDecode = rlp.decode(rlpEncode);
    const sig = ecsign(keccak256(rlpEncode), privateKey);

    const signature = rlp.encode([
      bnToHex(new BN(rawTx.nonce)),
      bnToHex(new BN(rawTx.gasPrice)),
      bnToHex(new BN(rawTx.gasLimit)),
      rawTx.feeCurrency || "0x",
      rawTx.gatewayFeeRecipient || "0x",
      rawTx.gatewayFee ? bnToHex(new BN(rawTx.gatewayFee)) : "0x",
      rawTx.to,
      rawTx.value ? bnToHex(new BN(rawTx.value)) : "0x",
      rawTx.data || "0x",
      bnToHex(
        new BN(
          27 +
            (sig.v === 0 || sig.v === 1 ? sig.v : 1 - (sig.v % 2)) +
            parseInt(rawTx.chainId, 10) * 2 +
            8
        )
      ),
      `0x${sig.r.toString("hex")}`,
      `0x${sig.s.toString("hex")}`,
    ]);

    return {
      rawTx,
      signedTx: {
        json: {
          nonce: `0x${(rlpDecode[0] as any as Buffer).toString("hex")}`,
          gasPrice: `0x${(rlpDecode[1] as any as Buffer).toString("hex")}`,
          gasLimit: `0x${(rlpDecode[2] as any as Buffer).toString("hex")}`,
          feeCurrency: `0x${(rlpDecode[3] as any as Buffer).toString("hex")}`,
          gatewayFeeRecipient: `0x${(rlpDecode[4] as any as Buffer).toString(
            "hex"
          )}`,
          gatewayFee: `0x${(rlpDecode[5] as any as Buffer).toString("hex")}`,
          to: `0x${(rlpDecode[6] as any as Buffer).toString("hex")}`,
          value: `0x${(rlpDecode[7] as any as Buffer).toString("hex")}`,
          data: `0x${(rlpDecode[8] as any as Buffer).toString("hex")}`,
          chainId: `0x${bnToHex(new BN(rawTx.chainId))}`,
          v: sig.v,
          r: `0x${sig.r.toString("hex")}`,
          s: `0x${sig.s.toString("hex")}`,
        },
        signature: `0x${signature.toString("hex")}`,
      },
    };
  }

  static signTx(node: BIP32Interface | string, rawTx: RawTx): SignedTx {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");

    if (privateKey) {
      if (!rawTx.chainId) {
        return KEYSTORE.legacySignTx(privateKey, rawTx);
      }

      if (rawTx.feeCurrency) {
        return KEYSTORE.celoSignTx(privateKey, rawTx);
      }

      if (rawTx.gasPrice) {
        return KEYSTORE.eip2930SignTx(privateKey, rawTx);
      }

      if (rawTx.maxFeePerGas) {
        return KEYSTORE.eip1559SignTx(privateKey, rawTx);
      }
    }

    return {
      rawTx,
    };
  }

  static async signMessage(node: BIP32Interface | string, msg: string) {
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
      const msgHex = isHexString(msg) ? msg : fromUtf8(msg);
      const messageBytes = hexToBytes(msgHex.replace("0x", ""));
      const messageBuffer = toBuffer(msgHex);
      const preamble = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
      const preambleBuffer = Buffer.from(preamble);
      const ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
      const sig = ecsign(keccak256(ethMessage), privateKey);
      const signature = Buffer.concat([
        sig.r,
        sig.s,
        toBuffer(intToHex(sig.v)),
      ]).toString("hex");

      return { msg, signedMsg: { signature: `0x${signature}` } };
    }
    return { msg };
  }
}
