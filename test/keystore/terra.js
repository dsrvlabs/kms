const { mnemonicToSeedSync } = require("bip39");
const { fromSeed } = require("bip32");
const { CHAIN } = require("../../lib");
const cosmos = require("../../lib/blockchains/cosmos/keyStore");

const { createKeyStore, getAccount } = require("./_getAccount");

const MNEMONIC = require("../mnemonic.json");

const TYPE = CHAIN.TERRA;
const INDEX = 0;

async function getDerivePath(path) {
  const mnemonic = MNEMONIC.bip44;
  const seed = mnemonicToSeedSync(mnemonic);
  const node = fromSeed(seed);
  return node.derivePath(
    `m/44'/${path.type}'/${path.account}'/0/${path.index}`
  );
}

async function signTx(path, keyStore, password) {
  try {
    const response = await cosmos.KEYSTORE.signTx(
      await getDerivePath(path, keyStore, password),
      {
        account_number: "0",
        chain_id: "tequila-0004",
        fee: { amount: [{ amount: "5000", denom: "uluna" }], gas: "200000" },
        memo: "Delegated with Ledger from union.market",
        msgs: [
          {
            type: "tendermint/PubKeySecp256k1",
            value: {
              amount: { amount: "100", denom: "uluna" },
              delegator_address: "terra17x2zx34mnaknc6znk3t0j334z9v9anu82sz60g",
              validator_address: "terra17lmam6zguazs5q5u6z5mmx76uj63gldnse2pdp",
            },
          },
        ],
        sequence: "0",
      },
      "terra"
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
