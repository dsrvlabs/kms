import { BIP32Interface } from "bip32";
import { privateToAddress, toChecksumAddress } from "ethereumjs-util";

import { utils } from "ethers";
import { SigningKey } from "@ethersproject/signing-key";
import { RawTx, SignedTx } from "../../types";
import { serializeCeloTransaction } from "@celo-tools/celo-ethers-wrapper/build/main/lib/transactions";
//import { CeloProvider } from "@celo-tools/celo-ethers-wrapper";

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
    const tx: any = await utils.resolveProperties(rawTx);

    const signature = signer.signDigest(
      utils.keccak256(serializeCeloTransaction(tx))
    );
    const serializedTx = await serializeCeloTransaction(tx, signature);

    /*
    transaction send test code 
    */

    // const provider = new CeloProvider(
    //   "https://alfajores-forno.celo-testnet.org"
    // );
    // const result = provider.sendTransaction(serializedTx);
    // console.log("sendTxResult: ", result);

    return { rawTx, signedTx: serializedTx };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
