import { mnemonicToSeedSync } from "bip39";
import { fromSeed } from "bip32";
import { CHAIN, BIP44, RawTx, SignedTx } from "./types";
import { KEYSTORE as mina } from "./blockchains/mina/keyStore";
import { KEYSTORE as celo } from "./blockchains/celo/keyStore";
import { KEYSTORE as cosmos } from "./blockchains/cosmos/keyStore";
import { KEYSTORE as terra } from "./blockchains/terra/keyStore";
import { KEYSTORE as solana } from "./blockchains/solana/keyStore";
import { KEYSTORE as polkadot } from "./blockchains/polkadot/keyStore";
import { KEYSTORE as kusama } from "./blockchains/kusama/keyStore";
import { KEYSTORE as near } from "./blockchains/near/keyStore";
import { KEYSTORE as flow } from "./blockchains/flow/keyStore";
import { KEYSTORE as tezos } from "./blockchains/tezos/keyStore";

export async function getAccountFromKeyStore(
  path: BIP44,
  mnemonic: string
): Promise<string | null> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );
    switch (path.type) {
      // blockchains
      case CHAIN.MINA: {
        const account = mina.getAccount(child);
        return account;
      }
      case CHAIN.CELO: {
        const account = celo.getAccount(child);
        return account;
      }
      case CHAIN.COSMOS: {
        const account = cosmos.getAccount(child);
        return account;
      }
      case CHAIN.TERRA: {
        const account = terra.getAccount(child);
        return account;
      }
      case CHAIN.SOLANA: {
        const account = solana.getAccount(seed, path);
        return account;
      }
      case CHAIN.POLKADOT: {
        const account = polkadot.getAccount(seed, path);
        return account;
      }
      case CHAIN.KUSAMA: {
        const account = kusama.getAccount(child);
        return account;
      }
      case CHAIN.NEAR: {
        const account = near.getAccount(seed, path);
        return account;
      }
      case CHAIN.FLOW: {
        const account = flow.getAccount(child);
        return account;
      }
      case CHAIN.TEZOS: {
        const account = tezos.getAccount(seed, path);
        return account;
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return null;
  }
}

export async function signTxFromKeyStore(
  path: BIP44,
  mnemonic: string,
  rawTx: RawTx
): Promise<SignedTx> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );

    switch (path.type) {
      // blockchains
      case CHAIN.MINA: {
        const response = mina.signTx(child, rawTx);
        return { ...response };
      }
      case CHAIN.NEAR: {
        const response = near.signTx(seed, path, rawTx);
        return { ...response };
      }
      case CHAIN.SOLANA: {
        const response = solana.signTx(seed, path, rawTx);
        return { ...response };
      }
      case CHAIN.CELO: {
        const response = celo.signTx(child, rawTx);
        return { ...response };
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }

    return { rawTx };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { rawTx };
  }
}
