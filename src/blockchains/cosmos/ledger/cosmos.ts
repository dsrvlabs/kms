import Transport from "@ledgerhq/hw-transport";
import * as secp256k1 from "secp256k1";
import { Account, BIP44, RawTx, SignedTx } from "../../../types";

const CosmosApp = require("ledger-cosmos-js").default;

// LEDGER
export class LEDGER {
  static async getAccount(
    path: BIP44,
    transport: Transport,
    prefix: string
  ): Promise<Account> {
    const instance = new CosmosApp(transport);
    const response = await instance.getAddressAndPubKey(
      [44, path.type, path.account, 0, path.index],
      prefix
    );
    return {
      address: response.bech32_address,
      publicKey: (response.compressed_pk as Buffer).toString("base64"),
    };
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const instance = new CosmosApp(transport);
    const response = await instance.sign(
      [44, path.type, path.account, 0, path.index],
      JSON.stringify({ ...rawTx })
    );
    // TODO: test
    const signature = secp256k1.signatureImport(
      Buffer.from(response.signature)
    );
    return { rawTx, signedTx: { signature } };
  }

  /*
  static async signMessage(
    path: BIP44,
    transport: Transport,
    msg: string
  ): Promise<SignedMsg> {
    // ...
  }
  */
}
