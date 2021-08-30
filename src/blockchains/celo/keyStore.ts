import { BIP32Interface } from "bip32";
import { privateToAddress, toChecksumAddress } from "ethereumjs-util";
import { RawTx } from "../../types";
import { newKit } from "@celo/contractkit";
// import { RawTx, SignedTx } from "../../types";

const base58check = require("base58check");

export class KEYSTORE {
  private static getPrivateKey(node: BIP32Interface): string {
    const privateKey = base58check.encode(
      node.privateKey ? `01${node.privateKey.toString("hex")}` : "",
      "5a"
    );
    return privateKey;
  }

  static getAccount(node: BIP32Interface): string {
    const { privateKey } = node;
    return privateKey
      ? toChecksumAddress(`0x${privateToAddress(privateKey).toString("hex")}`)
      : "";
  }

  static signTx(node: BIP32Interface, rawTx: RawTx): any {
    console.log("********get code: ", KEYSTORE.getPrivateKey(node));
    // const signer = new LocalSigner(KEYSTORE.getPrivateKey(node));
    console.log("node: ", node);
    console.log("rawTx: ", rawTx);
    // console.log("signer: ", signer);
    // signer.signTransaction(0, rawTx);

    const kit = newKit("https://alfajores-forno.celo-testnet.org");
    console.log("kit: ", kit);
    const result = kit.web3.eth.signTransaction(rawTx);
    console.log("result: ", result);

    /*
    const account = kit.web3.eth.accounts.privateKeyToAccount(
      KEYSTORE.getPrivateKey(node)
    );
    account.signTransaction();
    */
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
