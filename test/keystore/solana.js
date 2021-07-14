const { JWE } = require("node-jose");
const { mnemonicToSeedSync } = require("bip39");

const {
  Connection,
  StakeProgram,
  PublicKey,
  Authorized,
  LAMPORTS_PER_SOL,
  Lockup,
  Transaction,
  SystemProgram,
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
const DELEGATE = 1;

async function getStakeAccount(stakeAccountSeed, fromPublicKey) {
  const stakePubkey = await PublicKey.createWithSeed(
    fromPublicKey,
    stakeAccountSeed,
    StakeProgram.programId
  );
  return stakePubkey;
}

async function getSeed(keyStore, password) {
  const key = await getAlgo2HashKey(password, keyStore);
  const mnemonic = await JWE.createDecrypt(key).decrypt(keyStore.j.join("."));
  const seed = mnemonicToSeedSync(mnemonic.plaintext.toString());
  return seed;
}

async function createTransaction(response) {
  const transaction = new Transaction({
    recentBlockhash: response.rawTransaction.recentBlockhash,
    feePayer: response.rawTransaction.feePayer,
  });
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < response.rawTransaction.ixs.length; i++) {
    const ix = response.rawTransaction.ixs[i];
    if (ix.transactionType === 0) {
      const payerPublicKey = ix.fromPubkey;
      const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
      const toPubkey = new PublicKey(ix.toPubkey);
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: payerPublicKey,
        lamports,
        toPubkey,
      });
      transaction.add(transferInstruction);
    }
    if (ix.transactionType === 1) {
      const payerPublicKey = ix.fromPubkey;
      const authorized = new Authorized(
        ix.stakerAuthorizePubkey,
        ix.withdrawerAuthorizePubkey
      );
      const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
      const createStakeAccountInstruction = StakeProgram.createAccountWithSeed({
        fromPubkey: payerPublicKey,
        stakePubkey: ix.stakePubkey,
        basePubkey: payerPublicKey,
        seed: ix.stakeAccountSeed,
        authorized,
        lockup: new Lockup(0, 0, new PublicKey(0)),
        lamports,
      });
      const votePubkey = new PublicKey(ix.votePubkey);
      const delegateTransactionInstruction = StakeProgram.delegate({
        stakePubkey: ix.stakePubkey,
        authorizedPubkey: payerPublicKey,
        votePubkey,
      });
      transaction.add(createStakeAccountInstruction);
      transaction.add(delegateTransactionInstruction);
    }
  }
  return transaction;
}

async function sendTransation(connection, transaction) {
  try {
    await sendAndConfirmRawTransaction(connection, transaction.serialize(), {
      preflightCommitment: "confirmed",
    });
  } catch (error) {
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
    console.log("stakePubkey - ", STAKEPUBKEY.toString());
    const RECENTBLOCKHASH = await CONNECTION.getRecentBlockhash();
    const response = await solana.KEYSTORE.signTx(seed, path, {
      connection: CONNECTION,
      recentBlockhash: RECENTBLOCKHASH.blockhash,
      feePayer: ACCOUNTPUBKEY,
      ixs: [
        // Delegate
        {
          fromPubkey: ACCOUNTPUBKEY,
          stakerAuthorizePubkey: ACCOUNTPUBKEY,
          withdrawerAuthorizePubkey: ACCOUNTPUBKEY,
          votePubkey: "3NZ1Wa2spvK6dpbVBhgTh2qfjzNA6wxEAdXMsJJQCDQG",
          amountOfSOL: 0.3,
          stakePubkey: STAKEPUBKEY,
          stakeAccountSeed: STAKEACCOUNTSEED,
          transactionType: DELEGATE,
        },
        /*
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
    console.log("response - ", response);
    const transaction = await createTransaction(response);
    transaction.addSignature(
      response.signatures.publicKey,
      response.signatures.signature
    );
    console.log("verifySignature - ", transaction.verifySignatures());
    // Send Transaction
    // sendTransation(response.rawTransaction.connection, transaction);
  } catch (error) {
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
