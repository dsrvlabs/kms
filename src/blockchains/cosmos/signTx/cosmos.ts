import {
  DirectSecp256k1Wallet,
  makeSignDoc,
  makeAuthInfoBytes,
  encodePubkey,
} from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { sha256 } from "@terra-money/terra.js";
import { RawTx, SignedTx } from "../../../types";
import { registry } from "../utils/defaultRegistryTypes";

export async function cosmosSignTx(
  privateKey: Buffer,
  prefix: string,
  rawTx: RawTx
): Promise<SignedTx> {
  const wallet = await DirectSecp256k1Wallet.fromKey(
    new Uint8Array(privateKey),
    prefix
  );
  const accounts = await wallet.getAccounts();

  const txBodyEncodeObject = {
    typeUrl: "/cosmos.tx.v1beta1.TxBody",
    value: {
      messages: rawTx.msgs,
      memo: rawTx.memo,
    },
  };

  const txBodyBytes = registry.encode(txBodyEncodeObject);
  const pubkey = encodePubkey(encodeSecp256k1Pubkey(accounts[0].pubkey));

  const signDoc = makeSignDoc(
    txBodyBytes,
    makeAuthInfoBytes(
      [
        {
          pubkey,
          sequence: rawTx.signerData.sequence,
        },
      ],
      rawTx.fee.amount,
      rawTx.fee.gas
    ),
    rawTx.signerData.chainId,
    rawTx.signerData.accountNumber
  );

  const { signature } = await wallet.signDirect(accounts[0].address, signDoc);

  const txRaw = TxRaw.fromPartial({
    bodyBytes: signDoc.bodyBytes,
    authInfoBytes: signDoc.authInfoBytes,
    signatures: [new Uint8Array(Buffer.from(signature.signature, "base64"))],
  });

  const txByte = TxRaw.encode(txRaw).finish();

  return {
    rawTx,
    signedTx: {
      hashTx: Buffer.from(sha256(txByte)).toString("hex").toUpperCase(),
      serializedTx: `0x${Buffer.from(txByte).toString("hex")}`,
    },
  };
}
