const CodaSDK = require("@o1labs/client-sdk");

const {
  createKeyStore,
  getAccount,
  getMnemonic,
  CHAIN,
  signTxFromKeyStore,
  MNEMONIC,
} = require("./_getAccount");

const TYPE = CHAIN.MINA;
const INDEX = 0;

async function signTx(path, keyStore, password, account) {
  try {
    const isPayment = false;
    const mnemonic = await getMnemonic(password, keyStore);
    const response = await signTxFromKeyStore(path, mnemonic, {
      from: account,
      to: "B62qoBEWahYw3CzeFLBkekmT8B7Z1YsfhNcP32cantDgApQ97RNUMhT",
      amount: 3000000,
      fee: 1000000000,
      nonce: 1,
      isPayment,
    });
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    if (response.signedTx.payload.txType === 0) {
      // eslint-disable-next-line no-console
      console.log(
        "verifyPaymentSignature - ",
        CodaSDK.verifyPaymentSignature(response.signedTx)
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(
        "verifyStakeDelegationSignature - ",
        CodaSDK.verifyStakeDelegationSignature(response.signedTx)
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
