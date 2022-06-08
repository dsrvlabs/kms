import Transport from "@ledgerhq/hw-transport";
import LedgerEth from "@ledgerhq/hw-app-eth";
import { ec as EC } from "elliptic";
import { TransactionFactory } from "@ethereumjs/tx";
import LedgerCelo from "./ledger/celo";
import { BIP44, Account, CHAIN, SignedTx } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<Account> {
    try {
      const ec = new EC("secp256k1");
      if (path.type === CHAIN.ETHEREUM) {
        const instance = new LedgerEth(transport);
        const response = await instance.getAddress(
          `44'/${path.type}'/${path.account}'/0/${path.index}`
        );
        const compressedPublicKey = ec
          .keyFromPublic(response.publicKey, "hex")
          .getPublic()
          .encode("hex", true);
        return { address: response.address, publicKey: compressedPublicKey };
      }
      if (path.type === CHAIN.CELO) {
        const instance = new LedgerCelo(transport);
        const response = await instance.getAddress(
          `44'/${path.type}'/${path.account}'/0/${path.index}`
        );
        const compressedPublicKey = ec
          .keyFromPublic(response.publicKey, "hex")
          .getPublic()
          .encode("hex", true);
        return { address: response.address, publicKey: compressedPublicKey };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    return { address: "", publicKey: "" };
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    unsignedTx: string
  ): Promise<SignedTx> {
    const parsedTx = JSON.parse(unsignedTx);

    if (path.type === CHAIN.ETHEREUM) {
      const rawTx = TransactionFactory.fromTxData(parsedTx);
      const instance = new LedgerEth(transport);
      const response = await instance.signTransaction(
        `44'/${path.type}'/${path.account}'/0/${path.index}`,
        rawTx.serialize().toString("hex")
      );
      const signedTx = TransactionFactory.fromTxData({
        ...parsedTx,
        v: `0x${response.v}`,
        r: `0x${response.r}`,
        s: `0x${response.s}`,
      });
      return {
        hash: `0x${signedTx.hash().toString("hex")}`,
        serializedTx: `0x${signedTx.serialize().toString("hex")}`,
      };
    }
    if (path.type === CHAIN.CELO) {
      // TODO
    }
    return {};
  }
}
