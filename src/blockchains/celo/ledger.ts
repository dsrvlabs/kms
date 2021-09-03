import Transport from "@ledgerhq/hw-transport";
import Ledger from "@ledgerhq/hw-app-eth";
import { BIP44, RawTx, SignedTx } from "../../types";

import { serializeCeloTransaction } from "@celo-tools/celo-ethers-wrapper/build/main/lib/transactions";
// import { newKit } from "@celo/contractkit";
import { CeloProvider } from "@celo-tools/celo-ethers-wrapper";
import { utils } from "ethers";

// LEDGER
export class LEDGER {
  // static async sendTx(signedTx: any) {
  //   const kit = newKit("https://alfajores-forno.celo-testnet.org");
  //   const newTx = {
  //     ...signedTx,
  //     from: "0xdcb6702936a4C257c7e715BF780925a93B217e37",
  //   };
  //   console.log(newTx);
  //   const sendTxResult = await kit.sendTransaction(newTx);
  //   console.log("sendTxResult: ", sendTxResult);
  // }

  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    try {
      const instance = new Ledger(transport);
      const response = await instance.getAddress(
        `44'/${path.type}'/${path.account}'/0/${path.index}`
      );
      return response.address;
    } catch (error) {
      console.log(error);
    }
    return "";
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const ledger = new Ledger(transport);
    const encodedTx = serializeCeloTransaction(rawTx).slice(2);
    const signedTx = await ledger.signTransaction(
      `44'/${path.type}'/${path.account}'/0/${path.index}`,
      encodedTx
    );

    // let addToV = rawTx.chainId * 2 + 35;
    // const rv = parseInt(signedTx.v, 16);
    // if (rv !== addToV && (rv & addToV) !== rv) {
    //   addToV += 1;
    // }
    // signedTx.v = addToV.toString(10);

    // const sendTxResult = await this.sendTx(signedTx);
    // console.log("send: ", sendTxResult);

    const signature =
      "0x" + signedTx.r + signedTx.s + "0" + parseInt(signedTx.v).toString(16);
    console.log(signature);

    const tx = await utils.resolveProperties(rawTx);

    const provider = new CeloProvider(
      "https://alfajores-forno.celo-testnet.org"
    );

    const result = await provider.sendTransaction(
      serializeCeloTransaction(tx, signature)
    );
    console.log("sendTxResult: ", result);

    return {
      rawTx,
      signedTx: signedTx,
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
