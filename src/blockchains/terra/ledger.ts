import Transport from "@ledgerhq/hw-transport";
import TerraApp, { AddressResponse } from "@terra-money/ledger-terra-js";
import * as secp256k1 from "secp256k1";
import { BIP44, RawTx, SignedTx } from "../../types";

// LEDGER
export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<string> {
    const instance = new TerraApp(transport);
    await instance.initialize();
    const response = (await instance.getAddressAndPubKey(
      [44, path.type, path.account, 0, path.index],
      "terra"
    )) as AddressResponse;
    return response.bech32_address;
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const instance = new TerraApp(transport);
    const response = await instance.sign(
      [44, path.type, path.account, 0, path.index],
      JSON.stringify({ ...rawTx })
    );
    // TODO: test
    const signature = secp256k1.signatureImport(
      Buffer.from(response.signature.data)
    );
    return {
      rawTx,
      signedTx: signature,
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
