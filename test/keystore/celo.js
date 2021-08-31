const {
  createKeyStore,
  getAccount,
  getMnemonic,
  CHAIN,
  signTxFromKeyStore,
  MNEMONIC,
} = require("./_getAccount");

const TYPE = CHAIN.CELO;
const INDEX = 0;

async function signTx(path, keyStore, password, account) {
  try {
    const mnemonic = await getMnemonic(password, keyStore);
    const response = await signTxFromKeyStore(path, mnemonic, {
      raw: "string",
      tx: {
        nonce: 0,
        gasPrice: "1111",
        gas: "1111",
        feeCurrency: "1111",
        gatewayFeeRecipient: "1111",
        gatewayFee: "1111",
        to: "1111",
        value: "1111",
        input: "1111",
        r: "1111",
        s: "1111",
        v: "1111",
        hash: "1111",
      },
    });
    console.log("celo.js account: ", account);
    // eslint-disable-next-line no-console
    console.log("response - ", response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

async function run() {
  const PASSWORD = MNEMONIC.password;
  const keyStore = await createKeyStore(PASSWORD);
  console.log("keystore: ", keyStore);
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
