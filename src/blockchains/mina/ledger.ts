import Transport from "@ledgerhq/hw-transport";
import { BIP44, RawTx, SignedTx } from "../../types";

const BN = require("bn.js");
const { MinaLedgerJS, TxType, Networks } = require("mina-ledger-js");

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    const instance = new MinaLedgerJS(transport);
    const response = await instance.getAddress(path.account);
    return response.publicKey;
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const instance = new MinaLedgerJS(transport);
    const payload = {
      txType: rawTx.isDelegation ? TxType.DELEGATION : TxType.PAYMENT,
      networkId: rawTx.isDevNet ? Networks.DEVNET : Networks.MAINNET,
      amount: parseInt(rawTx.amount, 10),
      fee: parseInt(rawTx.fee, 10),
      nonce: parseInt(rawTx.nonce, 10),
      memo: rawTx.memo || "",
    };
    const response = await instance.signTransaction({
      ...payload,
      senderAccount: path.account,
      senderAddress: rawTx.from,
      receiverAddress: rawTx.to,
    });
    return {
      rawTx,
      signedTx: {
        publicKey: rawTx.from,
        signature: {
          field: new BN(response.signature.substring(0, 64), 16).toString(10),
          scalar: new BN(response.signature.substring(64, 128), 16).toString(
            10
          ),
        },
        payload: {
          ...payload,
          from: rawTx.from,
          to: rawTx.to,
        },
      },
    };
  }

  /*
  export function signMessage(
    path: BIP44,
    transport: Transport,
    msg: string) {
    // ...
  }
  */
}
