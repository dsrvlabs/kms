const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { providers, utils } = require("near-api-js");
const { KMS, CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.NEAR;
const INDEX = 1;

const TRANSFER = 0;
const DEPOSITANDSTAKE = 1;
const UNSTAKE = 2;
const UNSTAKEALL = 3;

async function sendTransaction(response) {
  const rpc = "https://rpc.testnet.near.org";
  const provider = new providers.JsonRpcProvider(rpc);
  const signedSerializedTx = response.signedTx.encode();
  const result = await provider.sendJsonRpc("broadcast_tx_commit", [
    Buffer.from(signedSerializedTx).toString("base64"),
  ]);
  return result;
}

async function signTx(transport, type, index, account) {
  const kms = new KMS({
    keyStore: null,
    transport,
  });
  try {
    const encodedPubKey = account;
    const helperURL = `https://helper.testnet.near.org/publicKey/${account}/accounts`;
    // eslint-disable-next-line no-undef
    const accountIds = await fetch(helperURL).then((res) => res.json());
    const signerId = accountIds[Object.keys(accountIds).length - 1];
    const receiverId = "masternode24.pool.f863973.m0";
    const rpc = "https://rpc.testnet.near.org";
    const provider = new providers.JsonRpcProvider(rpc);
    const accessKey = await provider.query(
      `access_key/${signerId}/${account}`,
      ""
    );
    const nonce = accessKey.nonce + 1;
    const recentBlockHash = utils.serialize.base_decode(accessKey.block_hash);
    const response = await kms.signTx(
      {
        type,
        account: 0,
        index,
      },
      {
        provider,
        recentBlockHash,
        nonce,
        signerId,
        receiverId,
        encodedPubKey,
        ixs: [
          {
            amount: "10",
            transactionType: TRANSFER,
          },
          {
            amount: "10",
            gas: "50000000000000",
            transactionType: DEPOSITANDSTAKE,
          },
          {
            amount: "9",
            gas: "50000000000000",
            transactionType: UNSTAKE,
          },
          {
            gas: "50000000000000",
            transactionType: UNSTAKEALL,
          },
        ],
      }
    );
    // eslint-disable-next-line no-console
    console.log("Transation signed - ", response);

    // SEND TRANSACTION
    const txResponse = await sendTransaction(response);
    // eslint-disable-next-line no-console
    console.log("Transaction sent - ", txResponse.transaction);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

async function run() {
  const transport = await TransportNodeHid.create(1000);
  const account = await getAccount(transport, TYPE, INDEX);
  await signTx(transport, TYPE, INDEX, account);
  transport.close();
}

run();
