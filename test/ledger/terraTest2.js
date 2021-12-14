const { LCDClient, MsgSend, MnemonicKey, SimplePublicKey } = require("@terra-money/terra.js");

const { StargateClient } = require("@cosmjs/stargate");
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.TERRA;
const INDEX = 0;
const mnemonic = require("../mnemonic.json");

async function run() {
  const transport = await TransportNodeHid.create(1000);
  const account = await getAccount(transport, TYPE, INDEX);
  console.log(2, account);

  const rpcUrl = "https://terra-rpc.easy2stake.com";
  const client = await StargateClient.connect(rpcUrl);
  const balance = await client.getAllBalances(account.address);
  const sequence = await client.getSequence(account.address);
  const chainId = await client.getChainId();
  
  console.log(3, client);
  console.log(4, balance, sequence, chainId);

  // connect to bombay testnet
  const terra = new LCDClient({
    URL: "https://lcd.terra.dev/",
    chainID: chainId,
  });

  // console.log(5, terra);

  const simplePubkey = new SimplePublicKey(account.publicKey);
  const wallet = terra.wallet(account.publicKey);
   // console.log(6, wallet);

  const send = new MsgSend(account.address, account.address, { uluna: 10000 });
  console.log(6, send);

  wallet
    .createAndSignTx({
      msgs: [send],
      memo: "test from terra.js!",
    })
    .then((tx) => console.log(JSON.stringify(tx, null, 2)));
}

run();
