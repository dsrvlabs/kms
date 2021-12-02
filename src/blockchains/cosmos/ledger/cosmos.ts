import Transport from "@ledgerhq/hw-transport";
// import * as secp256k1 from "secp256k1";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {
  AminoMsg,
  StdFee,
  makeSignDoc,
  StdSignDoc,
  encodeSecp256k1Pubkey,
} from "@cosmjs/amino";
import { Int53 } from "@cosmjs/math";
import {
  makeAuthInfoBytes,
  TxBodyEncodeObject,
  encodePubkey,
} from "@cosmjs/proto-signing";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { registry } from "../utils/defaultRegistryTypes";
import { Account, BIP44, RawTx, SignedTx } from "../../../types";
import { Secp256k1Signature } from "../utils/secp256k1signature";
import { AminoTypes } from "../utils/aminoTypes";
const CosmosApp = require("ledger-cosmos-js").default;

// LEDGER
function sortedObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortedObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key) => {
    result[key] = sortedObject(obj[key]);
  });
  return result;
}

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
    rawTx: RawTx,
    prefix: string
  ): Promise<SignedTx> {
    console.log(0, "cosmos ledger siged tx");
    const instance = new CosmosApp(transport);
    console.log(1, instance);

    const { publicKey } = await LEDGER.getAccount(path, transport, prefix);
    console.log(2, publicKey);

    const pubKey = encodePubkey(
      encodeSecp256k1Pubkey(new Uint8Array(Buffer.from(publicKey, "base64")))
    );

    const signDoc = makeSignDoc(
      rawTx.msgs as AminoMsg[],
      rawTx.fee as StdFee,
      rawTx.chain_id,
      rawTx.memo,
      rawTx.account_number,
      rawTx.sequence
    );
    const sorted: StdSignDoc = sortedObject(signDoc);
    console.log(3, JSON.stringify(signDoc, null, 2));

    const response = await instance.sign(
      [44, path.type, path.account, 0, path.index],
      JSON.stringify(sorted)
    );
    console.log(4, response);

    const aminoTypes = new AminoTypes({ prefix: rawTx.prefix });
    console.log(5, aminoTypes);

    const signedTxBody = {
      messages: sorted.msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: sorted.memo,
    };
    console.log(6, signedTxBody);

    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };
    console.log(7, signedTxBodyEncodeObject);

    const txBodyBytes = registry.encode(signedTxBodyEncodeObject);
    console.log(8, txBodyBytes);

    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;

    const signedSequence = Int53.fromString(rawTx.sequence).toNumber(); // CHECK

    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey: pubKey as any, sequence: signedSequence }],
      rawTx.fee.amount,
      rawTx.fee.gas,
      signMode
    );
    console.log(9, signedAuthInfoBytes);

    // temp
    const newSig = Secp256k1Signature.fromDer(
      new Uint8Array(response.signature)
    );
    console.log(10, typeof newSig);

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
    console.log(11, txRaw);

    return { rawTx, signedTx: { txRaw } };
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
