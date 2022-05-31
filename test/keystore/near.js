const BN = require("bn.js");
const { providers, utils, transactions } = require("near-api-js");

const {
  createKeyStore,
  getAccount,
  getMnemonic,
  CHAIN,
  signTxFromKeyStore,
  MNEMONIC,
} = require("./_getAccount");

const TYPE = CHAIN.NEAR;
const INDEX = 1;

/*
async function sendTransaction(signedTransaction) {
  const rpc = "https://rpc.testnet.near.org";
  const provider = new providers.JsonRpcProvider(rpc);
  const signedSerializedTx = signedTransaction.encode();
  const result = await provider.sendJsonRpc("broadcast_tx_commit", [
    Buffer.from(signedSerializedTx).toString("base64"),
  ]);
  return result;
}
*/
async function signTx(path, mnemonic, account) {
  try {
    const encodedPubKey = account;
    const helperURL = `https://helper.testnet.near.org/publicKey/${account}/accounts`;
    // eslint-disable-next-line no-undef
    const accountIds = await fetch(helperURL).then((res) => res.json());
    const signerId = accountIds[Object.keys(accountIds).length - 1];
    const rpc = "https://rpc.testnet.near.org";
    const provider = new providers.JsonRpcProvider(rpc);
    const accessKey = await provider.query(
      `access_key/${signerId}/${account}`,
      ""
    );
    const nonce = accessKey.nonce + 1;
    const recentBlockHash = utils.serialize.base_decode(accessKey.block_hash);

    /*
    const actions = [
      transactions.transfer(new BN(10)),
      transactions.functionCall(
        "deposit_and_stake",
        new Uint8Array(),
        new BN(10),
        new BN(50000000000000)
      ),
      transactions.functionCall(
        "unstake",
        Buffer.from(`{"amount": "${9}"}`),
        new BN(50000000000000),
        new BN(0)
      ),
      transactions.functionCall(
        "unstake_all",
        new Uint8Array(),
        new BN(50000000000000),
        new BN(0)
      ),
    ];
    */
    const actions = [transactions.transfer(new BN(10))];

    const transaction = transactions.createTransaction(
      signerId,
      utils.PublicKey.fromString(encodedPubKey),
      signerId,
      nonce,
      actions,
      recentBlockHash
    );

    const bytes = transaction.encode();

    const response = await signTxFromKeyStore(path, mnemonic, {
      encodedTx: Buffer.from(bytes).toString("base64"),
    });

    // eslint-disable-next-line no-console
    console.log("Transation signed - ", response);
    /*
    const signedTransaction = new transactions.SignedTransaction({
      transaction,
      signature: new transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: response.signedTx.signature,
      }),
    });
    // SEND TRANSACTION
    const txResponse = await sendTransaction(signedTransaction);
    // eslint-disable-next-line no-console
    console.log("Transaction sent - ", txResponse.transaction);
    */
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

async function run() {
  const PASSWORD = MNEMONIC.password;
  const keyStore = await createKeyStore(PASSWORD);
  const mnemonic = await getMnemonic(PASSWORD, keyStore);
  const account = await getAccount(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD
  );
  await signTx(
    { type: TYPE, account: 0, index: INDEX },
    mnemonic,
    account.address
  );
}

run();
