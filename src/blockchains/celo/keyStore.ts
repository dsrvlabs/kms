import { BIP32Interface } from "bip32";
import { privateToAddress, toChecksumAddress } from "ethereumjs-util";

import { utils } from "ethers";
// import { Signer } from "@ethersproject/abstract-signer";
// import { resolveProperties } from "@ethersproject/properties";
// import { TransactionRequest } from "@ethersproject/abstract-provider";
// import { getAddress } from "@ethersproject/address";
// import { serialize, UnsignedTransaction } from "@ethersproject/transactions";
// import { keccak256 } from "@ethersproject/keccak256";
import { SigningKey } from "@ethersproject/signing-key";
import { RawTx, SignedTx } from "../../types";
import { serializeCeloTransaction } from "@celo-tools/celo-ethers-wrapper/build/main/lib/transactions";

//const logger = new utils.Logger("CeloWallet");

export class KEYSTORE {
  private static getPrivateKey(node: BIP32Interface): string {
    const privateKey = node.privateKey?.toString("hex");
    return "0x" + privateKey;
  }

  static getAccount(node: BIP32Interface): string {
    const { privateKey } = node;
    return privateKey
      ? toChecksumAddress(`0x${privateToAddress(privateKey).toString("hex")}`)
      : "";
  }

  static async signTx(node: BIP32Interface, rawTx: RawTx): Promise<SignedTx> {
    const signer = new SigningKey(this.getPrivateKey(node));
    console.log("signer: ", signer);

    console.log(rawTx);
    const tx: any = await utils.resolveProperties(rawTx);
    console.log("tx: ", tx);
    console.log("serialize: ", serializeCeloTransaction(tx));
    const signature = signer.signDigest(
      utils.keccak256(serializeCeloTransaction(tx))
    );
    const serialized = serializeCeloTransaction(tx, signature);
    console.log(signature);
    return { rawTx, signedTx: serialized };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
