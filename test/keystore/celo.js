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
        gasPrice: "0011",
        gas: "0011",
        feeCurrency: "0011",
        gatewayFeeRecipient: "0011",
        gatewayFee: "0011",
        to: "0011",
        value: "0011",
        input: "0011",
        r: "0011",
        s: "0011",
        v: "0011",
        hash: "0011",
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
