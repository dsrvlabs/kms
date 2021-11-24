import { hash } from 'argon2-browser';
import { decode, encode } from 'bs58';
import { randomBytes } from 'crypto';
import { JWE, JWK, util } from 'node-jose';
import { KeyStore } from './type';

const HASH_LENGTH = 32;

async function getAlgo2HashKey(password: string, keyStore: KeyStore): Promise<JWK.Key> {
  const buf = await hash({
    pass: password,
    time: keyStore.t,
    mem: keyStore.m,
    salt: decode(keyStore.s),
    hashLen: HASH_LENGTH,
  });
  const key = await JWK.asKey({
    kty: 'oct',
    k: util.base64url.encode(buf.hashHex),
  });
  return key;
}

export async function createKeyStore(
  mnemonic: string[],
  password: string,
  time: number = 9,
  mem: number = 262144,
): Promise<KeyStore> {
  const encoder = new TextEncoder();
  const opt = { t: time, m: mem, s: encode(randomBytes(HASH_LENGTH)), j: [] };
  const key = await getAlgo2HashKey(password, opt);

  const jwe = await JWE.createEncrypt({ format: 'compact', contentAlg: 'A256GCM' }, key)
    .update(encoder.encode(mnemonic.join(' ')))
    .final();
  return { ...opt, j: jwe.split('.') };
}
