const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const CodaSDK = require("@o1labs/client-sdk");
const { KMS, COIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = COIN.MINA;
const INDEX = 0;

async function signTx(transport, type, index, account) {
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
        from: account,
        to: "B62qoBEWahYw3CzeFLBkekmT8B7Z1YsfhNcP32cantDgApQ97RNUMhT",
        amount: 3000000,
        fee: 1000000000,
        nonce: 1,
      }
    );
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    // eslint-disable-next-line no-console
    console.log("verify - ", CodaSDK.verifyPaymentSignature(response));
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
