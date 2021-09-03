const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { KMS, CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.TERRA;
const INDEX = 0;

async function signTx(transport, type, index) {
  const kms = new KMS({
    keyStore: null,
    transport,
  });
  try {
    const response = await kms.signTx(
      {
        type,
        account: 0,
        index,
      },
      {
        account_number: "0",
        chain_id: "bombay-0008",
        fee: { amount: [{ amount: "5000", denom: "uluna" }], gas: "200000" },
        memo: "Delegated with Ledger from union.market",
        msgs: [
          {
            type: "tendermint/PubKeySecp256k1",
            value: {
              amount: { amount: "100", denom: "uluna" },
              delegator_address: "terra17x2zx34mnaknc6znk3t0j334z9v9anu82sz60g",
              validator_address: "terra17lmam6zguazs5q5u6z5mmx76uj63gldnse2pdp",
            },
          },
        ],
        sequence: "0",
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
  await getAccount(transport, TYPE, INDEX);
  await signTx(transport, TYPE, INDEX);
  transport.close();
}

run();
