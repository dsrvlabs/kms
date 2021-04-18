import { hash } from "argon2";
import { randomBytes } from "crypto";
import { encode, decode } from "bs58";
import { JWK, JWE, util } from "node-jose";
import { mnemonicToSeedSync } from "bip39";
import { fromSeed } from "bip32";
import { COIN, BIP44 } from "./types";
import { KEYSTORE as mina } from "./blockchains/mina/keyStore";

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
): Promise<JWK.Key> {
  const buf = await hash(password, {
    timeCost: keyStore.t,
    memoryCost: keyStore.m,
    salt: decode(keyStore.s),
    saltLength: LENGTH,
    hashLength: LENGTH,
    raw: true,
  });
  const key = await JWK.asKey({
    kty: "oct",
    k: util.base64url.encode(buf.toString("hex")),
  });
  return key;
}

export async function createKeyStore(
  mnemonic: string[],
  password: string
): Promise<KeyStore> {
  const encoder = new TextEncoder();
  const opt = { t: 9, m: 262144, s: encode(randomBytes(LENGTH)), j: [] };
  const key = await getAlgo2HashKey(password, opt);
  const jwe = await JWE.createEncrypt(
    { format: "compact", contentAlg: "A256GCM" },
    key
  )
    .update(encoder.encode(mnemonic.join(" ")))
    .final();
  return { ...opt, j: jwe.split(".") };
}

export async function getAccountFromKeyStore(
  path: BIP44,
  keyStore: KeyStore,
  password: string
): Promise<string> {
  try {
    const key = await getAlgo2HashKey(password, keyStore);
    const mnemonic = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
    const seed = mnemonicToSeedSync(mnemonic.plaintext.toString()).toString(
      "hex"
    );
    const node = fromSeed(Buffer.from(seed, "hex"));
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );

    switch (path.type) {
      // blockchains
      case COIN.MINA: {
        const account = mina.getAccount(child);
        return account;
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }

    return "";
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return "";
  }
}
