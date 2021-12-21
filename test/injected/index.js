const EventEmitter = require("events");
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { CHAIN, createWeb3, createExtension } = require("../../lib");

const { getAccount } = require("../ledger/_getAccount");

const TYPE = CHAIN.SOLANA;
const INDEX = 0;

const main = async () => {
  const web3 = new EventEmitter();
  const extention = new EventEmitter();

  // injected web3
  const ledger = await TransportNodeHid.create();
  createWeb3(ledger, web3, extention);
  // injected web3

  // extension
  const transport = createExtension(web3, extention);
  await getAccount(transport, TYPE, INDEX);
  // extension
};

main();
