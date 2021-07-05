const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
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
    const isStake = false;
    const response = await kms.signTx(
      {
        type,
        account: 0,
        index,
      },
      {
        sender: "kms.testnet",
        receiver: "kms.testnet",
        provider: "https://rpc.testnet.near.org",
        amount: "1.2",
        accessKey: `access_key/kms.testnet/${account}`,
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