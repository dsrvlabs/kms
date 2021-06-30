const { JWE } = require("node-jose");
const { mnemonicToSeedSync } = require("bip39");
const { fromSeed } = require("bip32");
const CodaSDK = require("@o1labs/client-sdk");

const { CHAIN } = require("../../lib");
const mina = require("../../lib/blockchains/mina/keyStore");

const {
  createKeyStore,
  getAccount,
  getAlgo2HashKey,
} = require("./_getAccount");

const MNEMONIC = require("../mnemonic.json");

const TYPE = CHAIN.MINA;
const INDEX = 0;

async function getDerivePath(path, keyStore, password) {
  const key = await getAlgo2HashKey(password, keyStore);
  const mnemonic = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
  const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
  const node = fromSeed(seed);
  return node.derivePath(
    `m/44'/${path.type}'/${path.account}'/0/${path.index}`
  );
}

async function signTx(path, keyStore, password, account) {
  try {
    const isPayment = false;
    const response = mina.KEYSTORE.signTx(
      await getDerivePath(path, keyStore, password),
      {
        from: account,
        to: "B62qoBEWahYw3CzeFLBkekmT8B7Z1YsfhNcP32cantDgApQ97RNUMhT",
        amount: 3000000,
        fee: 1000000000,
        nonce: 1,
        isPayment,
      }
    );
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    if (response.payload.txType === 0) {
      // eslint-disable-next-line no-console
      console.log(
        "verifyPaymentSignature - ",
        CodaSDK.verifyPaymentSignature(response)
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(
        "verifyStakeDelegationSignature - ",
        CodaSDK.verifyStakeDelegationSignature(response)
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

async function run() {
  const PASSWORD = MNEMONIC.password;
  const keyStore = await createKeyStore(PASSWORD);
  const account = await getAccount(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD
  );
  await signTx(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD,
    account
  );
}

run();
