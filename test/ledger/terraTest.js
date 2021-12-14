const { LCDClient, MsgSend, MnemonicKey } = require("@terra-money/terra.js");
const {
  SignMode,
} = require("@terra-money/terra.proto/cosmos/tx/signing/v1beta1/signing");

const { StargateClient } = require("@cosmjs/stargate");
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { CHAIN } = require("../../lib");
const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.TERRA;
const INDEX = 0;
const mnemonic = require("../mnemonic.json");

async function run() {
  // create a key out of a mnemonic
  const mk = new MnemonicKey({
    mnemonic: mnemonic.bip44,
  });
  console.log(1, mk);

  const transport = await TransportNodeHid.create(1000);

  const account = await getAccount(transport, TYPE, INDEX);

  console.log(2, account);

  // const rpcUrl = "https://terra-mainnet-rpc.allthatnode.com/6bcgBDsMLTRuI8quUjCsDtguFmC4nlCK";
  // const rpcUrl = "https://lcd.terra.dev/";
  const rpcUrl = "https://terra-rpc.easy2stake.com";

  const client = await StargateClient.connect(rpcUrl);
  console.log(3, client);
  const balance = await client.getAllBalances(account.address);
  const sequence = await client.getSequence(account.address);
  console.log(1111, balance);
  const chainId = await client.getChainId();
  // connect to bombay testnet
  const terra = new LCDClient({
    URL: "https://lcd.terra.dev/",
    chainID: chainId,
  });
  console.log(4, terra);

  const wallet = terra.wallet(mk);
  console.log(5, wallet);

  // create a simple message that moves coin balances
  const send = new MsgSend(account.address, account.address, { uluna: 10000 });
  console.log(6, send);
  // const connect = terra.tx.create([
  //   {
  //     address: account.address,
  //     sequenceNumber: sequence,
  //     publicKey: account.publicKey,
  //   },
  // ]);
  // console.log(1111, connect);

  wallet
    .createAndSignTx({
      msgs: [send],
      memo: "",
      signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
    })
    .then((tx) => console.log(JSON.stringify(tx, null, 2)));
  // .then((result) => {
  //   console.log(`11111111 TX hash: ${result.txhash}`);
  // });
}

run();
