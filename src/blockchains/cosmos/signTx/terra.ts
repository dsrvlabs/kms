import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { Coin, Fee, Tx, TxBody, AuthInfo, RawKey } from "@terra-money/terra.js";
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
  const txBody = new TxBody(rawTx.msgs, rawTx.memo || "", timeoutHeight);
  const tx = new Tx(txBody, new AuthInfo([], fee), []);
  const signedTx = await rawKey.signTx(tx, {
    accountNumber: parseInt(rawTx.account_number, 10),
    sequence: parseInt(rawTx.sequence, 10),
    signMode: SignMode.SIGN_MODE_DIRECT,
    chainID: rawTx.chain_id,
  });

  return {
    rawTx,
    signedTx,
  };
}
