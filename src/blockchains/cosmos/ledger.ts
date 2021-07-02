import Transport from "@ledgerhq/hw-transport";
import * as secp256k1 from "secp256k1";
import { BIP44, RawTx } from "../../types";

const CosmosApp = require("ledger-cosmos-js").default;

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    const instance = new CosmosApp(transport);
    const response = await instance.getAddressAndPubKey(
      [44, path.type, path.account, 0, path.index],
      "cosmos"
    );
    return response.bech32_address;
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<{ [key: string]: any }> {
    const instance = new CosmosApp(transport);
    const response = await instance.sign(
      [44, path.type, path.account, 0, path.index],
      JSON.stringify({ ...rawTx })
    );
    // TODO: test
    const signature = secp256k1.signatureImport(
      Buffer.from(response.signature)
    );
    return { signature };
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
