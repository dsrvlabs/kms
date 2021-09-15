const {
  Secp256k1HdWallet,
  SigningCosmosClient,
  coins,
  coin,
  MsgDelegate,
} = require("@cosmjs/launchpad");

// …

const wallet = await Secp256k1HdWallet.generate();
const [{ address }] = await wallet.getAccounts();
console.log("Address:", address);

// Ensure the address has some tokens to spend

const lcdApi =
  "https://stargate-final--lcd--archive.datahub.figment.io/apikey/2367b7b2d8bae2654ec7c6c1f0dd72c6/syncing";
const client = new SigningCosmosClient(lcdApi, address, wallet);

// …
MsgDelegate

const msg: MsgDelegate = {
  type: "cosmos-sdk/MsgDelegate",
  value: {
    delegator_address: address,
    validator_address: "cosmosvaloper1yfkkk04ve8a0sugj4fe6q6zxuvmvza8r3arurr",
    amount: coin(300000, "ustake"),
  },
};
const fee = {
  amount: coins(2000, "ucosm"),
  gas: "180000", // 180k
};
await client.signAndBroadcast([msg], fee);
