const { KMS, CHAIN } = require("../../lib");

const { createKeyStore, getAccount } = require("./_getAccount");

const MNEMONIC = require("../mnemonic.json");

const TYPE = CHAIN.COSMOS;
const INDEX = 0;

async function signTx(path, keyStore, password) {
  const kms = new KMS({
    keyStore,
    transport: null,
  });
  try {
    const response = await kms.signTx(
      { ...path, password },
      {
        account_number: "6571",
        chain_id: "cosmoshub-2",
        fee: { amount: [{ amount: "5000", denom: "uatom" }], gas: "200000" },
        memo: "Delegated with Ledger from union.market",
        msgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
            value: {
              amount: [{ amount: "1000000", denom: "uatom" }],
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
