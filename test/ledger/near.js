const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { KMS, CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");
const nearAPI = require("near-api-js");

const TYPE = CHAIN.NEAR;
const INDEX = 1;

async function signTx(transport, type, index, account) {
  const kms = new KMS({
    keyStore: null,
    transport,
  });
  try {
    const isStake = false;
    const rpc = "https://rpc.testnet.near.org";
    const provider = new nearAPI.providers.JsonRpcProvider(rpc);
    const accessKey = await provider.query(`access_key/kms.testnet/${account}`, '');
    const response = await kms.signTx(
      {
        type,
        account: 0,
        index,
      },
      {
        sender: "kms.testnet",
        receiver: "kms.testnet",
        amount: "1.2",
        accessKey: accessKey,
        isStake,
        validator: "ed25519:DiogP36wBXKFpFeqirrxN8G2Mq9vnakgBvgnHdL9CcN3",
      }
    );
    console.log("response - ", response);

  } catch (error) {
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