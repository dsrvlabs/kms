import { BIP32Interface } from "bip32";
import { privateToAddress, toChecksumAddress } from "ethereumjs-util";
import { RawTx } from "../../types";
// import { newKit } from "@celo/contractkit";
// import { RawTx, SignedTx } from "../../types";
import { LocalSigner } from "@celo/wallet-local";
import { CeloTx, RLPEncodedTx } from "@celo/connect";
import { inputCeloTxFormatter } from "@celo/connect/lib/utils/formatter";
import { rlpEncodedTx } from "@celo/wallet-base";

const base58check = require("base58check");

export class KEYSTORE {
  private static getPrivateKey(node: BIP32Interface): string {
    const privateKey = base58check.encode(
      node.privateKey ? `01${node.privateKey.toString("hex")}` : "",
      "5a"
    );
    console.log("getPrivateKey 실행");
    return privateKey;
  }

  static getAccount(node: BIP32Interface): string {
    const { privateKey } = node;
    return privateKey
      ? toChecksumAddress(`0x${privateToAddress(privateKey).toString("hex")}`)
      : "";
  }

  static signTx(node: BIP32Interface, rawTx: RawTx): any {
    //const transaction = createTransaction();
    console.log("********get private key: ", KEYSTORE.getPrivateKey(node));
    const signer = new LocalSigner(KEYSTORE.getPrivateKey(node));
    console.log("node: ", node);
    console.log("rawTx: ", rawTx);
    console.log("signer: ", signer);
    const transaction: CeloTx = inputCeloTxFormatter(rawTx);
    const encodedTx: RLPEncodedTx = rlpEncodedTx(transaction);
    console.log("encodedTx: ", encodedTx);
    const result = signer.signTransaction(1, encodedTx);
    console.log("Result: ", result);

    // const kit = newKit("https://alfajores-forno.celo-testnet.org");
    // console.log("kit: ", kit);
    // const result = kit.web3.eth.signTransaction(rawTx);
    // console.log("result: ", result);

    // const account = kit.web3.eth.accounts.privateKeyToAccount(
    //   KEYSTORE.getPrivateKey(node)
    // );
    // console.log("in keystore ts: ", account);
    // account.signTransaction();
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
