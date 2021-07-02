const { hash } = require("argon2");
const { JWK, JWE, util } = require("node-jose");
const { encode, decode } = require("bs58");
const { randomBytes } = require("crypto");
const { mnemonicToSeedSync } = require("bip39");
const { fromSeed } = require("bip32");
const { CHAIN } = require("../lib");
const mina = require("../lib/blockchains/mina/keyStore");
const celo = require("../lib/blockchains/celo/keyStore");
const cosmos = require("../lib/blockchains/cosmos/keyStore");
const terra = require("../lib/blockchains/terra/keyStore");
const solana = require("../lib/blockchains/solana/keyStore");
const near = require("../lib/blockchains/near/keyStore");
const tezos = require("../lib/blockchains/tezos/keyStore");
const flow = require("../lib/blockchains/flow/keyStore");
// const polkadot = require("../lib/blockchains/polkadot/keyStore");
// const kusama = require("../lib/blockchains/kusama/keyStore");

const MNEMONIC = require("./mnemonic.json");

const LENGTH = 32;

async function getAlgo2HashKey(password, keyStore) {
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

async function createKeyStore(password) {
  const mnemonic = MNEMONIC.bip44.split(" ");
  const encoder = new TextEncoder();
  const opt = { t: 2, m: 2048, s: encode(randomBytes(LENGTH)), j: [] };
  const key = await getAlgo2HashKey(password, opt);
  const jwe = await JWE.createEncrypt(
    { format: "compact", contentAlg: "A256GCM" },
    key
  )
    .update(encoder.encode(mnemonic.join(" ")))
    .final();
  return { ...opt, j: jwe.split(".") };
}

async function getAccountFromKeyStore(path, keyStore, password) {
  try {
    const key = await getAlgo2HashKey(password, keyStore);
    const mnemonic = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
    const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
    const node = fromSeed(seed);
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );
    switch (path.type) {
      // blockchains
      case CHAIN.MINA: {
        const account = mina.KEYSTORE.getAccount(child);
        return account;
      }
      case CHAIN.CELO: {
        const account = celo.KEYSTORE.getAccount(child);
        return account;
      }
      case CHAIN.COSMOS: {
        const account = cosmos.KEYSTORE.getAccount(child);
        return account;
      }
      case CHAIN.TERRA: {
        const account = terra.KEYSTORE.getAccount(child);
        return account;
      }
      case CHAIN.SOLANA: {
        const account = solana.KEYSTORE.getAccount(seed, path);
        return account;
      }
      case CHAIN.NEAR: {
        const account = near.KEYSTORE.getAccount(seed, path);
        return account;
      }
      case CHAIN.TEZOS: {
        const account = tezos.KEYSTORE.getAccount(seed, path);
        return account;
      }
      case CHAIN.FLOW: {
        const account = flow.KEYSTORE.getAccount(child);
        return account;
      }
      /*
      case CHAIN.POLKADOT: {
        const account = polkadot.KEYSTORE.getAccount(seed, path);
        return account;
      }
      case CHAIN.KUSAMA: {
        const account = kusama.KEYSTORE.getAccount(child);
        return account;
      }
      */
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

async function run() {
  const PASSWORD = MNEMONIC.password;
  const accounts = {};
  const keyStore = await createKeyStore(PASSWORD);
  const chains = [
    ["MINA", CHAIN.MINA],
    ["NEAR", CHAIN.NEAR],
    ["SOLANA", CHAIN.SOLANA],
    ["CELO", CHAIN.CELO],
    ["COSMOS", CHAIN.COSMOS],
    ["TERRA", CHAIN.TERRA],
    ["TEZOS", CHAIN.TEZOS],
    ["FLOW", CHAIN.FLOW],
    /*
    ["POLKADOT", CHAIN.POLKADOT],
    ["KUSAMA", CHAIN.KUSAMA],
    */
  ];
  for (let i = 0; i < chains.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const temp = await getAccountFromKeyStore(
      { type: chains[i][1], account: 0, index: 0 },
      keyStore,
      PASSWORD
    );
    accounts[chains[i][0]] = temp;
  }
  // eslint-disable-next-line no-console
  console.log(accounts);
}

run();
