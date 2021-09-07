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
      nonce: "0x0a",
      gasPrice: "0x09184e72a000",
      gasLimit: "0x9710",
      feeCurrency: "",
      gatewayFeeRecipient: "",
      gatewayFee: "",
      to: "0xdcb6702936a4C257c7e715BF780925a93B217e37",
      value: "0x00",
      data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057",
      chainId: 44787,
    });
    // eslint-disable-next-line no-console
    console.log("Transation signed - ", response);
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
