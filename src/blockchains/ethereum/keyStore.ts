import { BIP32Interface } from "bip32";
import { Transaction, FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { publicToAddress } from "ethereumjs-util";
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
      ...rawTx,
    });
    const signedTx = tx.sign(privateKey);
    return {
      rawTx,
      signedTx: {
        json: signedTx.toJSON(),
        signature: signedTx.serialize().toString("hex"),
      },
    };
  }

  private static celoSignTx(privateKey: Buffer, rawTx: RawTx): SignedTx {
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
            ...rawTx,
          });
          const signedTx = tx.sign(node.privateKey);
          return {
            rawTx,
            signedTx: {
              json: signedTx.toJSON(),
              signature: signedTx.serialize().toString("hex"),
            },
          };
        }
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
