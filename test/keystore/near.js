const { JWE } = require("node-jose");
const { mnemonicToSeedSync } = require("bip39");
const { CHAIN } = require("../../lib");
const near = require("../../lib/blockchains/near/keyStore");
const nearAPI = require("near-api-js");

const {
  createKeyStore,
  getAccount,
  getAlgo2HashKey,
} = require("./_getAccount");

const MNEMONIC = require("../mnemonic.json");
const TYPE = CHAIN.NEAR;
const INDEX = 1;

async function getSeed(keyStore, password) {
  const key = await getAlgo2HashKey(password, keyStore);
  const mnemonic = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
  const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
  return seed
}

async function signTx(seed, path, account) {
  try {
    const isStake = false;
    const rpc = "https://rpc.testnet.near.org";
    const provider = new nearAPI.providers.JsonRpcProvider(rpc);
    const accessKey = await provider.query(`access_key/kms.testnet/${account}`, '');
    const response = await near.KEYSTORE.signTx( 
      seed,
      path,
      {
        sender: "kms.testnet",
        receiver: "kms.testnet",
        amount: "1.7",
        accessKey: accessKey,
        isStake,
        validator: "ed25519:DiogP36wBXKFpFeqirrxN8G2Mq9vnakgBvgnHdL9CcN3", 
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
  const account = await getAccount(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD
  );
  await signTx(
    SEED, 
    { type: TYPE, account: 0, index: INDEX },
    account
  );
}

run();


