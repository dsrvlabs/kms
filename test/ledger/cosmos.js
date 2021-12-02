const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { StargateClient } = require("@cosmjs/stargate");
const { TxRaw } = require("cosmjs-types/cosmos/tx/v1beta1/tx");
const { KMS, CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.COSMOS;
const INDEX = 0;

async function signTx(
  transport,
  type,
  index,
  account,
  accountNumber,
  sequence,
  chainId
) {
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
        account_number: `${accountNumber}`,
        chain_id: chainId,
        fee: {
          amount: [
            {
              denom: "uatom",
              amount: "10000",
            },
          ],
          gas: "180000",
        },
        memo: "",
        msgs: [
          {
            type: "cosmos-sdk/MsgSend", // Check

            value: {
              amount: [
                {
                  denom: "uatom",
                  amount: "10000",
                },
              ],
              from_address: account.address,
              to_address: account.address,
            },
          },
        ],
        sequence: `${sequence}`,
      }
    );
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

async function run() {
  const rpcUrl = "https://rpc.cosmos.network";

  const transport = await TransportNodeHid.create(1000);
  console.log(11, transport);

  const account = await getAccount(transport, TYPE, INDEX);
  console.log(22, account);

  const client = await StargateClient.connect(rpcUrl);
  console.log(33, client);

  const sequence = await client.getSequence(account.address);
  console.log(44, sequence);

  // const balance = await client.getAllBalances(account.address);
  // console.log(55, balance);

  const chainId = await client.getChainId();
  const signing = await signTx(
    transport,
    TYPE,
    INDEX,
    account,
    sequence.accountNumber,
    sequence.sequence,
    chainId
  );

  console.log(66, JSON.stringify(signing, null, 2));

  const txRawCall = signing.signedTx.txRaw;
  console.log(txRawCall);

  const txBytes = TxRaw.encode(txRawCall).finish();
  console.log(77, txBytes);
  const testing = await client.broadcastTx(txBytes);
  // eslint-disable-next-line no-console
  console.log(2222, testing);
  transport.close();
}

run();
