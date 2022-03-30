import { BIP32Interface } from "bip32";
import {
  AccessListEIP2930Transaction,
  FeeMarketEIP1559Transaction,
} from "@ethereumjs/tx";
import {
  privateToAddress,
  privateToPublic,
  publicToAddress,
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

  private static klaySignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    return KEYSTORE.eip2930SignTx(privateKey, rawTx);
  }

  static signTx(node: BIP32Interface | string, rawTx: RawTx): SignedTx {
    const privateKey =
      typeof node !== "string"
        ? node.privateKey
        : Buffer.from(node.replace("0x", ""), "hex");

    if (privateKey) {
      switch (parseInt(rawTx.chainId, 10)) {
        case 1: // main
        case 3: // ropsten
        case 4: // rinkeby
        case 5: // gorli
        case 42220: // celo mainnet
        case 44787: // celo Alfajores
        case 62320: // celo Baklava
          return KEYSTORE.eip1559SignTx(privateKey, rawTx);
        case 1001: // klaytn testnet
        case 8217: // klaytn mainnet
          return KEYSTORE.klaySignTx(privateKey, rawTx);
        case 25: // Cronos Mainnet Beta
        case 338: // Cronos Testnet
        case 9000: // evmos testnet
        case 245022934: // Neon EVM MainNet
        case 245022926: // Neon EVM DevNet
        case 245022940: // Neon EVM TestNet
        case 1313161554: // aurora mainnet
        case 1313161555: // aurora testnet
        case 1313161556: // aurora betanet
        default:
          return KEYSTORE.eip2930SignTx(privateKey, rawTx);
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
