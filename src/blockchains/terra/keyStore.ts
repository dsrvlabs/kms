import { BIP32Interface } from "bip32";
import CryptoJS from "crypto-js";
import { bech32 } from "bech32";
import {
  Secp256k1Wallet,
  AminoMsg,
  StdFee,
  makeSignDoc as aMakeSignDoc,
} from "@cosmjs/amino";
import { RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  static bech32ify(address: string, prefix: string) {
    const words = bech32.toWords(Buffer.from(address, "hex"));
    return bech32.encode(prefix, words);
  }

  static getAccount(node: BIP32Interface): string {
    const message = CryptoJS.enc.Hex.parse(node.publicKey.toString("hex"));
    const temp = CryptoJS.RIPEMD160(CryptoJS.SHA256(message) as any).toString();
    const address = KEYSTORE.bech32ify(temp, "terra");
    return address;
  }

  static async signTx(node: BIP32Interface, rawTx: RawTx): Promise<SignedTx> {
    if (node.privateKey) {
      const wallet = await Secp256k1Wallet.fromKey(
        new Uint8Array(node.privateKey),
        "terra"
      );
      const signDoc = aMakeSignDoc(
        rawTx.msgs as AminoMsg[],
        rawTx.fee as StdFee,
        rawTx.chain_id,
        rawTx.memo,
        rawTx.account_number,
        rawTx.sequence
      );

      const address = KEYSTORE.getAccount(node);
      const response = await wallet.signAmino(address, signDoc);
      return {
        rawTx,
        signedTx: new Uint8Array(
          Buffer.from(response.signature.signature, "base64")
        ),
      };
    }
    return { rawTx };
  }

  // static signTx(node: BIP32Interface, rawTx: RawTx): { [key: string]: any } {
  //   const signature;
  //   const publicKey;
  //   const { sequence, account_number, chain_id } = request;
  //   const _req = { sequence, accountNumber: account_number, chainId: chain_id };
  //   const signMessage = createSignMessage(tx, _req);

  //   try {
  //     ({ signature, publicKey } = await signer(signMessage));
  //   } catch (err) {
  //     throw new Error(`Signing failed: ${err.message}`);
  //   }

  //   const signatureObject = createSignature(
  //     signature,
  //     sequence,
  //     account_number,
  //     publicKey
  //   );
  //   return createSignedTransactionObject(tx, signatureObject);
  // }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
