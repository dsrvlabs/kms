import { randomBytes } from "crypto";
import { encode, decode } from "bs58";
import { JWK, JWE, util } from "node-jose";
import { mnemonicToSeedSync } from "bip39";
import { fromSeed } from "bip32";
import { CHAIN, BIP44, RawTx } from "./types";
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

export interface KeyStore {
  t: number;
  m: number;
  s: string;
  j: string[];
}

const LENGTH = 32;
async function getAlgo2HashKey(
  password: string,
  keyStore: KeyStore
): Promise<JWK.Key | null> {
  const { argon2 } = window as { [key: string]: any };
  if (argon2 && argon2.hash) {
    const buf = await argon2.hash({
      pass: password,
      time: keyStore.t,
      mem: keyStore.m,
      salt: decode(keyStore.s),
      hashLen: LENGTH,
    });
    const key = await JWK.asKey({
      kty: "oct",
      k: util.base64url.encode(buf.hashHex),
    });
    return key;
  }
  return null;
}

export async function createKeyStore(
  mnemonic: string[],
  password: string,
  time: number = 9,
  mem: number = 262144
): Promise<KeyStore | null> {
  const encoder = new TextEncoder();
  const opt = { t: time, m: mem, s: encode(randomBytes(LENGTH)), j: [] };
  const key = await getAlgo2HashKey(password, opt);
  if (key) {
    const jwe = await JWE.createEncrypt(
      { format: "compact", contentAlg: "A256GCM" },
      key
    )
      .update(encoder.encode(mnemonic.join(" ")))
      .final();
    return { ...opt, j: jwe.split(".") };
  }
  return null;
}

export async function getAccountFromKeyStore(
  path: BIP44,
  keyStore: KeyStore,
  password: string
): Promise<string> {
  try {
    const key = await getAlgo2HashKey(password, keyStore);
    if (key && keyStore) {
      const mnemonic = await JWE.createDecrypt(key).decrypt(
        keyStore.j.join(".")
      );
      const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
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
    }

    return "";
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return "";
  }
}

export async function signTxFromKeyStore(
  path: BIP44,
  keyStore: KeyStore,
  password: string,
  rawTx: RawTx
): Promise<{ [key: string]: any }> {
  try {
    const key = await getAlgo2HashKey(password, keyStore);
    if (key && keyStore) {
      const mnemonic = await JWE.createDecrypt(key).decrypt(
        keyStore.j.join(".")
      );
      const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
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
        // add blockchains....
        // blockchains
        default:
          break;
      }
    }

    return {};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return {};
  }
}
