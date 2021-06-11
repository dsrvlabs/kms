import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import * as secp256k1 from "secp256k1";
import { BIP44, RawTx } from "../../types";

const CosmosApp = require("ledger-cosmos-js").default;

// LEDGER
export class LEDGER {
  static async getAccount(
    path: BIP44,
    transport: TransportWebUSB | TransportNodeHid
  ): Promise<string> {
    const instance = new CosmosApp(transport);
    const response = await instance.getAddressAndPubKey(
      [44, path.type, path.account, 0, path.index],
      "cosmos"
    );
    return response.bech32_address;
  }

  static async signTx(
    path: BIP44,
    transport: TransportWebUSB | TransportNodeHid,
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
    transport: TransportWebUSB | TransportNodeHid,
    msg: string) {
    // ...
  }
  */
}
