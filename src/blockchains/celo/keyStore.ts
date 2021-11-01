import { utils } from "ethers";
import { SigningKey } from "@ethersproject/signing-key";

import { BIP32Interface } from "bip32";
import { privateToAddress, toChecksumAddress } from "ethereumjs-util";
import { serializeCeloTransaction, parseCeloTransaction } from "./transactions";
import { Account, RawTx, SignedTx } from "../../types";

export class KEYSTORE {
  private static getPrivateKey(node: BIP32Interface): string {
    const privateKey = node.privateKey?.toString("hex");
    return `0x${privateKey}`;
  }

  static getAccount(node: BIP32Interface): Account | null {
    const { privateKey, publicKey } = node;
    return privateKey
      ? {
          address: toChecksumAddress(
            `0x${privateToAddress(privateKey).toString("hex")}`
          ),
          publicKey: publicKey.toString("hex"),
        }
      : null;
  }

  static async signTx(node: BIP32Interface, rawTx: RawTx): Promise<SignedTx> {
    const signer = new SigningKey(this.getPrivateKey(node));
    const tx = await utils.resolveProperties(rawTx);

    // https://github.com/celo-tools/celo-ethers-wrapper/blob/d38601317eee84d853eb369b9165100bad4bdb54/src/lib/CeloWallet.ts
    const signature = signer.signDigest(
      utils.keccak256(serializeCeloTransaction(tx))
    );
    const serializedTx = serializeCeloTransaction(tx, signature);
    const parsedTx = parseCeloTransaction(serializedTx);
    const signedTx = { ...parsedTx, v: parsedTx.v?.toString(10) };

    return {
      rawTx,
      signedTx: {
        signature: { v: signedTx.v, r: signedTx.r, s: signedTx.s },
        serializedTx,
      },
    };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
