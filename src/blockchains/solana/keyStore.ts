import { encode } from "bs58";
import { derivePath } from "near-hd-key";
import {
  Keypair,
  PublicKey,
  StakeProgram,
  Authorized,
  Transaction,
  Signer,
  LAMPORTS_PER_SOL,
  Lockup,
} from "@solana/web3.js";
import { BIP44, RawTx } from "../../types";

export class KEYSTORE {
  static getKeypair(seed: Buffer, path: BIP44): Keypair {
    const { key } = derivePath(
      `m/44'/${path.type}'/${path.account}'/${path.index}'`,
      seed.toString("hex")
    );
    return Keypair.fromSeed(key);
  }

  static getAccount(seed: Buffer, path: BIP44): string {
    const keypair = KEYSTORE.getKeypair(seed, path);
    return keypair.publicKey.toString();
  }

  static getPrivateKey(seed: Buffer, path: BIP44): string {
    const keypair = KEYSTORE.getKeypair(seed, path);
    return encode(keypair.secretKey);
  }

  static async signTx(seed: Buffer, path: BIP44, rawTx: RawTx) {
    const payer = KEYSTORE.getKeypair(seed, path);
    const authorized = new Authorized(payer.publicKey, payer.publicKey);
    const lamports = Number(rawTx.amountOfSOL) * LAMPORTS_PER_SOL;
    const createStakeAccountInstruction = StakeProgram.createAccountWithSeed({
      fromPubkey: payer.publicKey,
      stakePubkey: rawTx.stakePubkey,
      basePubkey: payer.publicKey,
      seed: rawTx.stakeAccountSeed,
      authorized,
      lockup: new Lockup(0, 0, new PublicKey(0)),
      lamports,
    });
    const votePubkey = new PublicKey(rawTx.votePubkey);
    const delegateTransactionInstruction = StakeProgram.delegate({
      stakePubkey: rawTx.stakePubkey,
      authorizedPubkey: payer.publicKey,
      votePubkey,
    });
    const transaction = new Transaction({
      recentBlockhash: rawTx.recentBlockhash,
      feePayer: payer.publicKey,
      signatures: [],
    }).add(createStakeAccountInstruction);
    transaction.add(delegateTransactionInstruction);
    transaction.sign(<Signer>payer);
    return {
      signatures: {
        signature: transaction.signatures[0].signature,
        publicKey: transaction.signatures[0].publicKey,
      },
      rawTransaction: rawTx,
    };
  }

  /*
  export signMessage(node: BIP32Interface, msg: string) {
    // ...
  }
  */
}
