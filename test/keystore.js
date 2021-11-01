const { JWE } = require("node-jose");
const { encode } = require("bs58");
const { randomBytes } = require("crypto");
const { CHAIN, getAccountFromKeyStore, getAlgo2HashKey } = require("../lib");

const MNEMONIC = require("./mnemonic.json");

const LENGTH = 32;

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

async function getAccount(path, keyStore, password) {
  try {
    const key = await getAlgo2HashKey(password, keyStore);
    const decryped = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
    const mnemonic = await getAccountFromKeyStore(
      path,
      decryped.plaintext.toString()
    );
    return mnemonic;
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
    ["DSRV", CHAIN.DSRV],
    ["CELO", CHAIN.CELO],
    ["COSMOS", CHAIN.COSMOS],
    ["TERRA", CHAIN.TERRA],
    ["PERSISTENCE", CHAIN.PERSISTENCE],
    ["MINA", CHAIN.MINA],
    ["NEAR", CHAIN.NEAR],
    ["SOLANA", CHAIN.SOLANA],
    ["TEZOS", CHAIN.TEZOS],
    /*
    ["FLOW", CHAIN.FLOW],
    ["POLKADOT", CHAIN.POLKADOT],
    ["KUSAMA", CHAIN.KUSAMA],
    */
  ];
  for (let i = 0; i < chains.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const temp = await getAccount(
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
