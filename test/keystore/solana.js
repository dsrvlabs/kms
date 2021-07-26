const { JWE } = require("node-jose");
const { mnemonicToSeedSync } = require("bip39");

const {
  Connection,
  StakeProgram,
  PublicKey,
  sendAndConfirmRawTransaction,
} = require("@solana/web3.js");

const { CHAIN } = require("../../lib");
const solana = require("../../lib/blockchains/solana/keyStore");

const {
  createKeyStore,
  getAccount,
  getAlgo2HashKey,
} = require("./_getAccount");

const MNEMONIC = require("../mnemonic.json");

const TYPE = CHAIN.SOLANA;
const INDEX = 0;

const TRANSFER = 0;
const CREATESTAKEACCONUT = 1;
const DELEGATE = 2;
const UNDELEGATE = 3;

async function getStakeAccount(stakeAccountSeed, fromPublicKey) {
  const stakePubkey = await PublicKey.createWithSeed(
    fromPublicKey,
    stakeAccountSeed,
    StakeProgram.programId
  );
  // eslint-disable-next-line no-console
  console.log("stakePubkey - ", stakePubkey.toString());
  return stakePubkey;
}

async function getSeed(keyStore, password) {
  const key = await getAlgo2HashKey(password, keyStore);
  const mnemonic = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
  const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
  return seed;
}

async function sendTransation(connection, transaction) {
  try {
    await sendAndConfirmRawTransaction(connection, transaction.serialize(), {
      preflightCommitment: "confirmed",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

async function signTx(seed, path, account) {
  try {
    const RPC = "https://api.devnet.solana.com"; // DEV NET
    const CONNECTION = new Connection(RPC, "confirmed");
    const timeStamp = new Date().getTime();
    const STAKEACCOUNTSEED = timeStamp.toString();
    const ACCOUNTPUBKEY = new PublicKey(account);
    const STAKEPUBKEY = await getStakeAccount(STAKEACCOUNTSEED, ACCOUNTPUBKEY);
    const RECENTBLOCKHASH = await CONNECTION.getRecentBlockhash();
    const response = await solana.KEYSTORE.signTx(seed, path, {
      connection: CONNECTION,
      recentBlockhash: RECENTBLOCKHASH.blockhash,
      feePayer: ACCOUNTPUBKEY,
      ixs: [
        // Create Stake Account
        {
          fromPubkey: ACCOUNTPUBKEY,
          basePubkey: ACCOUNTPUBKEY,
          stakerAuthorizePubkey: ACCOUNTPUBKEY,
          withdrawerAuthorizePubkey: ACCOUNTPUBKEY,
          stakePubkey: STAKEPUBKEY,
          amountOfSOL: 0.1,
          stakeAccountSeed: STAKEACCOUNTSEED,
          transactionType: CREATESTAKEACCONUT,
        },
        // Delegate
        {
          authorizedPubkey: ACCOUNTPUBKEY,
          votePubkey: "3NZ1Wa2spvK6dpbVBhgTh2qfjzNA6wxEAdXMsJJQCDQG",
          stakePubkey: STAKEPUBKEY,
          transactionType: DELEGATE,
        },
        /*
        // Undelegate
        {
          authorizedPubkey: ACCOUNTPUBKEY,
          stakePubkey: "DmS2tb8dvRYx8Utmw5CdUEpLzGPur3RtshjHRLUzjLWT",
          transactionType: UNDELEGATE,
        },
        // Transfer
        {
          fromPubkey: ACCOUNTPUBKEY,
          toPubkey: "4GnH1wZuKDAbWvdgVp6Dap7o2SUbjoFPLPkeNgBxqZRQ",
          amountOfSOL: 0.1,
          transactionType: TRANSFER,
        },
        */
      ],
    });
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    // eslint-disable-next-line no-console
    console.log("verifySignature - ", response.signedTx.verifySignatures());
    // Send Transaction
    // sendTransation(CONNECTION, response.signedTx);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

async function run() {
  const PASSWORD = MNEMONIC.password;
  const keyStore = await createKeyStore(PASSWORD);
  const SEED = await getSeed(keyStore, PASSWORD);
  const account = await getAccount(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD
  );
  await signTx(SEED, { type: TYPE, account: 0, index: INDEX }, account);
}

run();
