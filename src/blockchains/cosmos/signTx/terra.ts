import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import {
  Coin,
  Fee,
  Tx,
  TxBody,
  AuthInfo,
  RawKey,
  sha256,
  Msg,
} from "@terra-money/terra.js";
import { RawTx, SignedTx } from "../../../types";

export async function terraSignTx(
  privateKey: Buffer,
  _prefix: string,
  rawTx: RawTx
): Promise<SignedTx> {
  const rawKey = new RawKey(privateKey);

  const coins: Coin[] = rawTx.fee.amount.map((fee: any): any => {
    return new Coin(fee.denom, fee.amount);
  });

  const fee = new Fee(Number.parseInt(rawTx.fee.gas, 10), coins);
  const timeoutHeight = 0;
  const aminoMsgs = rawTx.msgs.map((msg: any) => Msg.fromAmino(msg) || msg);
  const txBody = new TxBody(aminoMsgs, rawTx.memo || "", timeoutHeight);
  const tx = new Tx(txBody, new AuthInfo([], fee), []);
  const txRaw = await rawKey.signTx(tx, {
    accountNumber: parseInt(rawTx.account_number, 10),
    sequence: parseInt(rawTx.sequence, 10),
    signMode: SignMode.SIGN_MODE_DIRECT,
    chainID: rawTx.chain_id,
  });

  const txByte = txRaw.toBytes();

  return {
    rawTx,
    signedTx: {
      hashTx: Buffer.from(sha256(txByte)).toString("hex").toUpperCase(),
      serializedTx: `0x${Buffer.from(txByte).toString("hex")}`,
    },
  };
}
