const { ethers } = require("ethers");

const {
  createKeyStore,
  getAccount,
  getMnemonic,
  CHAIN,
  signTxFromKeyStore,
  MNEMONIC,
} = require("./_getAccount");

const TYPE = CHAIN.ETHEREUM;
const INDEX = 0;

const provider = new ethers.providers.JsonRpcProvider(
  "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
);
/*
async function sendTx(signedTx) {
  // console.log(ethers.utils.parseTransaction(`0x${signedTx.signature}`));
  const recept = await provider.sendTransaction(`0x${signedTx.signature}`);
  console.log(recept);
}
*/

async function signTx(path, keyStore, password, address) {
  let response;
  try {
    const mnemonic = await getMnemonic(password, keyStore);
    const nonce = await provider.getTransactionCount(address);
    const gasLimit = await provider.estimateGas({
      value: "0x1",
      to: address,
    });
    response = await signTxFromKeyStore(path, mnemonic, {
      nonce,
      gasLimit: gasLimit.toString(),
      maxFeePerGas: "2500000040",
      maxPriorityFeePerGas: "2500000000",
      to: address,
      value: "1",
      chainId: "3",
    });
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    // eslint-disable-next-line no-console
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return response;
}

async function run() {
  const PASSWORD = MNEMONIC.password;
  const keyStore = await createKeyStore(PASSWORD);
  const account = await getAccount(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD
  );
  const signedTx = await signTx(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD,
    account.address
  );
  console.log(signedTx);
  // await sendTx(signedTx.signedTx);
}

run();
