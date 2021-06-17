const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { KMS, COIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = COIN.COSMOS;
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
        account_number: "6571",
        chain_id: "cosmoshub-2",
        fee: { amount: [{ amount: "5000", denom: "uatom" }], gas: "200000" },
        memo: "Delegated with Ledger from union.market",
        msgs: [
          {
            type: "cosmos-sdk/MsgDelegate",
            value: {
              amount: { amount: "1000000", denom: "uatom" },
              delegator_address:
                "cosmos102hty0jv2s29lyc4u0tv97z9v298e24t3vwtpl",
              validator_address:
                "cosmosvaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7",
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
