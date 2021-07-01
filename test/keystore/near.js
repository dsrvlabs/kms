const { JWE } = require("node-jose");
const { mnemonicToSeedSync } = require("bip39");
const { COIN } = require("../../lib");
const near = require("../../lib/blockchains/near/keyStore");

const {
  createKeyStore,
  getAccount,
  getAlgo2HashKey,
} = require("./_getAccount");

const MNEMONIC = require("../mnemonic.json");
const TYPE = COIN.NEAR;
const INDEX = 1;

async function getSeed(keyStore, password) {
  const key = await getAlgo2HashKey(password, keyStore);
  const mnemonic = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
  const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
  return seed
}

async function signTx(seed, path) {
  try {
    const isStake = false;
    const response = await near.KEYSTORE.signTx( 
      seed,
      path,
      {
        sender: "kms.testnet",
        receiver: "receiver.testnet",
        networkId: "testnet",
        amount: "0.5",
        isStake,
      }
    );
    console.log("response - ", response);

  } catch (error) {
    console.log(error);
  }
}

async function run() {
  const PASSWORD = MNEMONIC.password;
  const keyStore = await createKeyStore(PASSWORD);
  const SEED = await getSeed(
    keyStore,
    PASSWORD
  );
  await getAccount(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD
  );
  await signTx(
    SEED, 
    { type: TYPE, account: 0, index: INDEX }
  );
}

run();


