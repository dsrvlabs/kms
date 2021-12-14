/* eslint-disable camelcase */
import Transport from "@ledgerhq/hw-transport";
// import * as secp256k1 from "secp256k1";
// import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
// import {
//   AminoMsg,
//   StdFee,
//   makeSignDoc,
//   StdSignDoc,
//   encodeSecp256k1Pubkey,
// } from "@cosmjs/amino";
// import { Int53 } from "@cosmjs/math";
// import {
//   makeAuthInfoBytes,
//   TxBodyEncodeObject,
//   encodePubkey,
// } from "@cosmjs/proto-signing";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import TerraApp, { AddressResponse } from "@terra-money/ledger-terra-js";
import {
  SignDoc,
  SignerOptions,
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
// import { registry } from "../utils/defaultRegistryTypes";
import { Account, BIP44, RawTx, SignedTx } from "../../../types";
import { Secp256k1Signature } from "../utils/secp256k1signature";
// import { AminoTypes } from "../utils/aminoTypes";

// const CosmosApp = require("ledger-cosmos-js").default;

// LEDGER
// function sortedObject(obj: any): any {
//   if (typeof obj !== "object" || obj === null) {
//     return obj;
//   }
//   if (Array.isArray(obj)) {
//     return obj.map(sortedObject);
//   }
//   const sortedKeys = Object.keys(obj).sort();
//   const result: Record<string, any> = {};
//   // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
//   sortedKeys.forEach((key) => {
//     result[key] = sortedObject(obj[key]);
//   });
//   return result;
// }

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

    const { address, publicKey } = await LEDGER.getAccount(path, transport);

    console.log(2, publicKey);

    const pubKey = new SimplePublicKey(publicKey);
    console.log(3, pubKey);
    console.log(4, rawTx.account_number);

    const signerDatas: SignerOptions[] = [
      {
        address,
        sequenceNumber: rawTx.sequence,
        publicKey: pubKey,
      },
    ];

    console.log(5, signerDatas);

    const coins: Coin[] = rawTx.fee.amount.map((fee: any): any => {
      return new Coin(fee.denom, fee.amount);
    });
    console.log(6, coins);


    const aminoMsgs = rawTx.msgs.map((msg: any) => Msg.fromAmino(msg));

    console.log(7, rawTx.msgs);
    console.log(8, aminoMsgs);
    console.log("msg", aminoMsgs[0].toAmino());

    const fee = new Fee(Number.parseInt(rawTx.fee.gas, 10), coins, "", "");
    const timeoutHeight = 0;
    const tx = new Tx(
      new TxBody(aminoMsgs, rawTx.memo || "", timeoutHeight),
      new AuthInfo([], fee),
      []
    );
    console.log("Tx", tx);
    const copyTx = new Tx(tx.body, new AuthInfo([], tx.auth_info.fee), []);
    const sign_doc = new SignDoc(
      rawTx.chain_id,
      parseInt(rawTx.account_number, 10),
      parseInt(rawTx.sequence, 10),
      copyTx.auth_info,
      copyTx.body
    );
    // console.log(9, JSON.stringify(sign_doc, null, 2));
    console.log(9, sign_doc.toJSON());
    console.log(555555, sign_doc.toAminoJSON());
    console.log(666666, Buffer.from(sign_doc.toAminoJSON()));
    const response = await instance.sign(
      [44, path.type, path.account, 0, path.index],
      Buffer.from(sign_doc.toAminoJSON())
    );
    console.log(777777, response);

    console.log("response", response);

    const newSig = Secp256k1Signature.fromDer(
      new Uint8Array(response.signature.data)
    );
    console.log(1111111, newSig);
    console.log(1111111, response.signature);

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

    console.log(10, signature);
    console.log(11, copyTx);
    /*
    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;

    // ????
    const signedSequence = Int53.fromString(rawTx.sequence).toNumber(); // CHECK

    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey: pubKey as any, sequence: signedSequence }],
      rawTx.fee.amount,
      rawTx.fee.gas,
      signMode
    );
    // ????

    const aminoTypes = new AminoTypes({ prefix: rawTx.prefix }); // ?

    const signedTxBody = {
      messages: rawTx.msgs.map((msg: AminoMsg) => aminoTypes.fromAmino(msg)),
      memo: rawTx.memo,
    }; // ??

    const signDoc = new SignDoc(
      rawTx.chain_id,
      rawTx.account_number,
      rawTx.sequence,
      signedAuthInfoBytes,
      signedTxBody
    );
    const sorted: StdSignDoc = sortedObject(signDoc);

    const response = await instance.sign(
      [44, path.type, path.account, 0, path.index],
      JSON.stringify(sorted)
    );
    console.log(5, response);

    /*
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };

    const txBodyBytes = registry.encode(signedTxBodyEncodeObject);

    // temp
    const newSig = Secp256k1Signature.fromDer(
      new Uint8Array(response.signature.data)
    );
    console.log(1111111, newSig);

    console.log(
      1111111,
      Buffer.from(response.signature.data).toString("base64")
    );
    // console.log(1111111, Buffer.from(response.signature.data, "base64"));

    const mergedArray = new Uint8Array(newSig.r.length + newSig.s.length);
    mergedArray.set(newSig.r);
    mergedArray.set(newSig.s, newSig.r.length);
    // temp

    const txRaw = TxRaw.fromPartial({
      bodyBytes: txBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      // signatures: [new Uint8Array(newSig.toFixedLength())],
      signatures: [new Uint8Array(mergedArray)],
    });
    */
    // return { rawTx, signedTx: { txRaw } };
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
