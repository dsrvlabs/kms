const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const BN = require("bn.js");
const { providers, utils, transactions } = require("near-api-js");
const { KMS, CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.NEAR;
const INDEX = 1;

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
        recentBlockHash,
        nonce,
        signerId,
        receiverId,
        encodedPubKey,
        txs: [
          JSON.stringify(transactions.transfer(new BN(10))),
          JSON.stringify(
            transactions.functionCall(
              "deposit_and_stake",
              new Uint8Array(),
              new BN(10),
              new BN(50000000000000)
            )
          ),
          JSON.stringify(
            transactions.functionCall(
              "unstake",
              Buffer.from(`{"amount": "${9}"}`),
              new BN(50000000000000),
              new BN(0)
            )
          ),
          JSON.stringify(
            transactions.functionCall(
              "unstake_all",
              new Uint8Array(),
              new BN(50000000000000),
              new BN(0)
            )
          ),
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
  await signTx(transport, TYPE, INDEX, account.address);
  transport.close();
}

run();
