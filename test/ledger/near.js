const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const nearAPI = require("near-api-js");
const { KMS, CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.NEAR;
const INDEX = 1;

async function signTx(transport, type, index, account) {
  const kms = new KMS({
    keyStore: null,
    transport,
  });
  try {
    const isStake = true;
    const rpc = "https://rpc.testnet.near.org";
    const provider = new nearAPI.providers.JsonRpcProvider(rpc);
    const accessKey = await provider.query(
      `access_key/kms.testnet/${account}`,
      ""
    );
    const response = await kms.signTx(
      {
        type,
        account: 0,
        index,
      },
      {
        sender: "kms.testnet",
        receiver: "masternode24.pool.f863973.m0",
        amount: "1.2",
        accessKey,
        isStake,
        gas: "300000000000000",
      }
    );
    // eslint-disable-next-line no-console
    console.log("response - ", response);
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
