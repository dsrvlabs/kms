const {
  // Authorized,
  Connection,
  // StakeProgram,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  // Lockup,
  // sendAndConfirmRawTransaction,
} = require("@solana/web3.js");

const {
  createKeyStore,
  getAccount,
  getMnemonic,
  CHAIN,
  signTxFromKeyStore,
  MNEMONIC,
} = require("./_getAccount");

const TYPE = CHAIN.SOLANA;
const INDEX = 0;

/*
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
*/
/*
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
*/
async function signTx(path, mnemonic, account) {
  try {
    const RPC = "https://api.devnet.solana.com"; // DEV NET
    const CONNECTION = new Connection(RPC, "confirmed");
    // const timeStamp = new Date().getTime();
    // const STAKEACCOUNTSEED = timeStamp.toString();
    const ACCOUNTPUBKEY = new PublicKey(account);
    // const STAKEPUBKEY = await getStakeAccount(STAKEACCOUNTSEED, ACCOUNTPUBKEY);
    const RECENTBLOCKHASH = await CONNECTION.getRecentBlockhash();
    const response = await signTxFromKeyStore(path, mnemonic, {
      connection: CONNECTION,
      recentBlockhash: RECENTBLOCKHASH.blockhash,
      feePayer: ACCOUNTPUBKEY,
      txs: [
        /*
        // Create Stake Account
        StakeProgram.createAccountWithSeed({
          fromPubkey: ACCOUNTPUBKEY,
          stakePubkey: STAKEPUBKEY,
          basePubkey: ACCOUNTPUBKEY,
          seed: STAKEACCOUNTSEED,
          authorized: new Authorized(ACCOUNTPUBKEY, ACCOUNTPUBKEY),
          lockup: new Lockup(0, 0, new PublicKey(0)),
          lamports: Number(0.1) * LAMPORTS_PER_SOL,
        }),
        // Delegate
        StakeProgram.delegate({
          stakePubkey: STAKEPUBKEY,
          authorizedPubkey: ACCOUNTPUBKEY,
          votePubkey: new PublicKey(
            "3NZ1Wa2spvK6dpbVBhgTh2qfjzNA6wxEAdXMsJJQCDQG"
          ),
        }),
        */
        /*
        // Undelegate
        StakeProgram.deactivate({
          authorizedPubkey: ACCOUNTPUBKEY,
          stakePubkey: "DmS2tb8dvRYx8Utmw5CdUEpLzGPur3RtshjHRLUzjLWT",
        }),
        */
        // Transfer
        SystemProgram.transfer({
          fromPubkey: ACCOUNTPUBKEY,
          lamports: Number(0.1) * LAMPORTS_PER_SOL,
          toPubkey: ACCOUNTPUBKEY,
        }),
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
  const mnemonic = await getMnemonic(PASSWORD, keyStore);
  const account = await getAccount(
    { type: TYPE, account: 0, index: INDEX },
    keyStore,
    PASSWORD
  );
  await signTx(
    { type: TYPE, account: 0, index: INDEX },
    mnemonic,
    account.address
  );
}

run();
