/* eslint-disable camelcase */
import Transport from "@ledgerhq/hw-transport";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import TerraApp, { AddressResponse } from "@terra-money/ledger-terra-js";
import {
  SignDoc,
  SimplePublicKey,
  Coin,
  Fee,
  Tx,
  TxBody,
  AuthInfo,
  SignatureV2,
  Msg,
  SignerInfo,
  ModeInfo,
} from "@terra-money/terra.js";
import { Account, BIP44, RawTx, SignedTx } from "../../../types";
import { Secp256k1Signature } from "../utils/secp256k1signature";

export class LEDGER {
  static async getAccount(path: BIP44, transport: Transport): Promise<Account> {
    const instance = new TerraApp(transport);
    await instance.initialize();
    const response = (await instance.getAddressAndPubKey(
      [44, path.type, path.account, 0, path.index],
      "terra"
    )) as AddressResponse;
    return {
      address: response.bech32_address,
      publicKey: Buffer.from(response.compressed_pk.data).toString("base64"),
    };
  }

  static async signTx(
    path: BIP44,
    transport: Transport,
    rawTx: RawTx
  ): Promise<SignedTx> {
    const instance = new TerraApp(transport);

    const { publicKey } = await LEDGER.getAccount(path, transport);

    const pubKey = new SimplePublicKey(publicKey);

    const coins: Coin[] = rawTx.fee.amount.map((fee: any): any => {
      return new Coin(fee.denom, fee.amount);
    });

    const aminoMsgs = rawTx.msgs.map((msg: any) => Msg.fromAmino(msg));

    const fee = new Fee(Number.parseInt(rawTx.fee.gas, 10), coins, "", "");
    const timeoutHeight = 0;
    const tx = new Tx(
      new TxBody(aminoMsgs, rawTx.memo || "", timeoutHeight),
      new AuthInfo([], fee),
      []
    );

    const copyTx = new Tx(tx.body, new AuthInfo([], tx.auth_info.fee), []);
    const sign_doc = new SignDoc(
      rawTx.chain_id,
      parseInt(rawTx.account_number, 10),
      parseInt(rawTx.sequence, 10),
      copyTx.auth_info,
      copyTx.body
    );
    const response = await instance.sign(
      [44, path.type, path.account, 0, path.index],
      Buffer.from(sign_doc.toAminoJSON())
    );

    const newSig = Secp256k1Signature.fromDer(
      new Uint8Array(response.signature.data)
    );

    const mergedArray = new Uint8Array(newSig.r.length + newSig.s.length);
    mergedArray.set(newSig.r);
    mergedArray.set(newSig.s, newSig.r.length);
    // temp

    const signature = new SignatureV2(
      pubKey,
      new SignatureV2.Descriptor(
        new SignatureV2.Descriptor.Single(
          SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
          Buffer.from(mergedArray).toString("base64")
        )
      ),
      rawTx.sequence
    );

    const sigData = signature.data.single as SignatureV2.Descriptor.Single;
    copyTx.signatures.push(...tx.signatures, sigData.signature);
    copyTx.auth_info.signer_infos.push(
      ...tx.auth_info.signer_infos,
      new SignerInfo(
        signature.public_key,
        signature.sequence,
        new ModeInfo(new ModeInfo.Single(sigData.mode))
      )
    );

    return { rawTx, signedTx: { tx: copyTx } };
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
