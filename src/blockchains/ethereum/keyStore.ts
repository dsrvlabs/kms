import { BIP32Interface } from "bip32";
import { Transaction, FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import {
  publicToAddress,
  rlp,
  bnToHex,
  keccak256,
  ecsign,
} from "ethereumjs-util";
import { Account, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static getAccount(node: BIP32Interface): Account {
    return {
      publicKey: `0x${node.publicKey.toString("hex")}`,
      address: `0x${publicToAddress(node.publicKey, true).toString("hex")}`,
    };
  }

  private static legacySignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    const tx = Transaction.fromTxData({
      nonce: bnToHex(rawTx.nonce),
      gasPrice: bnToHex(rawTx.gasPrice),
      gasLimit: bnToHex(rawTx.gasLimit),
      to: rawTx.to,
      value: rawTx.value ? bnToHex(rawTx.value) : "0x",
      data: rawTx.data ? bnToHex(rawTx.data) : "0x",
    });
    const signedTx = tx.sign(privateKey);
    const json = signedTx.toJSON();
    return {
      rawTx,
      signedTx: {
        json: { ...json, v: parseInt(json.v || "0x0", 16) },
        signature: signedTx.serialize().toString("hex"),
      },
    };
  }

  private static celoSignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    const rlpEncode = rlp.encode([
      bnToHex(rawTx.nonce),
      bnToHex(rawTx.gasPrice),
      bnToHex(rawTx.gasLimit),
      rawTx.feeCurrency ? bnToHex(rawTx.feeCurrency) : "0x",
      rawTx.gatewayFeeRecipient ? bnToHex(rawTx.gatewayFeeRecipient) : "0x",
      rawTx.gatewayFee ? bnToHex(rawTx.gatewayFee) : "0x",
      rawTx.to,
      rawTx.value ? bnToHex(rawTx.value) : "0x",
      rawTx.data ? bnToHex(rawTx.data) : "0x",
      bnToHex(rawTx.chainId),
      "0x",
      "0x",
    ]);
    const rlpDecode = rlp.decode(rlpEncode);
    const signature = ecsign(keccak256(rlpEncode), privateKey, rawTx.chainId);
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
          chainId: `0x${(rlpDecode[9] as any as Buffer).toString("hex")}`,
          v: signature.v,
          r: `0x${signature.r.toString("hex")}`,
          s: `0x${signature.s.toString("hex")}`,
        },
      },
    };
  }

  private static klaySignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
    return KEYSTORE.legacySignTx(privateKey, rawTx);
  }

  static signTx(node: BIP32Interface, rawTx: RawTx): SignedTx {
    if (node.privateKey) {
      switch (rawTx.chainId) {
        case 1: // main
        case 3: // ropsten
        case 4: // rinkeby
        case 5: {
          const tx = FeeMarketEIP1559Transaction.fromTxData({
            nonce: rawTx.nonce,
            gasLimit: rawTx.gasPrice,
            to: rawTx.to,
            value: rawTx.value,
            data: rawTx.data,
            chainId: rawTx.chainId,
            accessList: rawTx.accessList,
            maxPriorityFeePerGas: rawTx.maxPriorityFeePerGas,
            maxFeePerGas: rawTx.maxFeePerGas,
          });
          const signedTx = tx.sign(node.privateKey);
          const json = signedTx.toJSON();
          return {
            rawTx,
            signedTx: {
              json: { ...json, v: parseInt(json.v || "0x0", 16) },
              signature: signedTx.serialize().toString("hex"),
            },
          };
        }
        case 1001: // klaytn testnet
        case 8217: // klaytn mainnet
          return KEYSTORE.klaySignTx(node.privateKey, rawTx);
        case 42220: // celo mainnet
        case 44787: // celo Alfajores
        case 62320: // celo Baklava
          return KEYSTORE.celoSignTx(node.privateKey, rawTx);
        case 9000: // evmos testnet
        case 1313161554: // aurora mainnet
        case 1313161555: // aurora testnet
        case 1313161556: // aurora betanet
        default:
          return KEYSTORE.legacySignTx(node.privateKey, rawTx);
      }
    }
    return {
      rawTx,
    };
  }
}
