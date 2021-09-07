const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { KMS, CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.CELO;
const INDEX = 0;

const { CeloProvider } = require("@celo-tools/celo-ethers-wrapper");
const {
  serializeCeloTransaction,
} = require("@celo-tools/celo-ethers-wrapper/build/main/lib/transactions");
const { utils } = require("ethers");

async function sendTx(rawTx, signedTx) {
  const tx = await utils.resolveProperties(rawTx);
  const provider = new CeloProvider("https://alfajores-forno.celo-testnet.org");
  const result = await provider.sendTransaction(
    serializeCeloTransaction(tx, {
      ...signedTx,
      r: "0x" + signedTx.r,
      s: "0x" + signedTx.s,
      v: parseInt(signedTx.v),
    })
  );
  console.log("sendTxResult: ", result);
}

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
        nonce: "0x1a",
        gasPrice: "0x09184e72a000",
        gasLimit: "0x9710",
        feeCurrency: "",
        gatewayFeeRecipient: "",
        gatewayFee: "",
        to: "0xdcb6702936a4C257c7e715BF780925a93B217e37",
        value: "0x00",
        data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057",
        chainId: 44787,
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
  const transport = await TransportNodeHid.create(1000);
  const account = await getAccount(transport, TYPE, INDEX);
  const signedTx = await signTx(transport, TYPE, INDEX, account);
  await sendTx(signedTx.rawTx, signedTx.signedTx);
  transport.close();
}

run();
