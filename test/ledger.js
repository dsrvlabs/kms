const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { getAccount } = require("./ledger/_getAccount");
const { COIN } = require("../lib");

const TYPE = COIN.NEAR;
const INDEX = 0;

async function run() {
  const transport = await TransportNodeHid.create(1000);
  await getAccount(transport, TYPE, INDEX);
  transport.close();
}

run();
