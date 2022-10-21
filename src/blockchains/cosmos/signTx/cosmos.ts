import * as secp256k1 from "secp256k1";
import {
  DirectSecp256k1Wallet,
  makeSignDoc,
  makeAuthInfoBytes,
  encodePubkey,
  makeSignBytes,
} from "@cosmjs/proto-signing";
import { SignDoc, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { ecsign, keccak256, sha256 } from "ethereumjs-util";
import { SignedTx } from "../../../types";
import { registry } from "../utils/defaultRegistryTypes";

export function signInject(messgae: Buffer, privateKey: Buffer) {
  const messageHash = keccak256(messgae);
  const signature = ecsign(messageHash, privateKey);
  return {
    signature: `0x${Buffer.concat([signature.r, signature.s]).toString("hex")}`,
    publicKey: Buffer.from(
      secp256k1.publicKeyCreate(privateKey, true)
    ).toString("base64"),
  };
}

export function signCosmos(messgae: Buffer, privateKey: Buffer) {
  const messageHash = sha256(messgae);
  const signature = secp256k1.ecdsaSign(messageHash, privateKey);

  return {
    signature: `0x${Buffer.from(signature.signature).toString("hex")}`,
    publicKey: Buffer.from(
      secp256k1.publicKeyCreate(privateKey, true)
    ).toString("base64"),
  };
}

function getSignDoc(publicKey: Uint8Array, parsedTx: any): SignDoc {
  if (typeof parsedTx === "string") {
    return SignDoc.decode(Buffer.from(parsedTx.replace("0x", ""), "hex"));
  }
  const txBodyEncodeObject = {
    typeUrl: "/cosmos.tx.v1beta1.TxBody",
    value: {
      messages: parsedTx.msgs,
      memo: parsedTx.memo,
    },
  };

  const txBodyBytes = registry.encode(txBodyEncodeObject);
  const pubkey = encodePubkey(encodeSecp256k1Pubkey(publicKey));

  return makeSignDoc(
    txBodyBytes,
    makeAuthInfoBytes(
      [
        {
          pubkey,
          sequence: parsedTx.signerData.sequence,
        },
      ],
      parsedTx.fee.amount,
      parsedTx.fee.gas
    ),
    parsedTx.signerData.chainId,
    parsedTx.signerData.accountNumber
  );
}

export async function cosmosSignTx(
  privateKey: Buffer,
  prefix: string,
  parsedTx: any
): Promise<SignedTx> {
  const wallet = await DirectSecp256k1Wallet.fromKey(
    new Uint8Array(privateKey),
    prefix
  );
  const accounts = await wallet.getAccounts();

  const signDoc = getSignDoc(accounts[0].pubkey, parsedTx);

  if (prefix === "inj") {
    const signByte = makeSignBytes(signDoc);
    const { signature } = signInject(Buffer.from(signByte), privateKey);

    const txRaw = TxRaw.fromPartial({
      bodyBytes: signDoc.bodyBytes,
      authInfoBytes: signDoc.authInfoBytes,
      signatures: [
        new Uint8Array(Buffer.from(signature.replace("0x", ""), "base64")),
      ],
    });

    const txByte = TxRaw.encode(txRaw).finish();

    return {
      hash: keccak256(Buffer.from(txByte)).toString("hex").toUpperCase(),
      serializedTx: `0x${Buffer.from(txByte).toString("hex")}`,
    };
  }

  const { signature, signed } = await wallet.signDirect(
    accounts[0].address,
    signDoc
  );

  const txRaw = TxRaw.fromPartial({
    bodyBytes: signed.bodyBytes,
    authInfoBytes: signed.authInfoBytes,
    signatures: [new Uint8Array(Buffer.from(signature.signature, "base64"))],
  });

  const txByte = TxRaw.encode(txRaw).finish();

  return {
    hash: sha256(Buffer.from(txByte)).toString("hex").toUpperCase(),
    serializedTx: `0x${Buffer.from(txByte).toString("hex")}`,
  };
}
