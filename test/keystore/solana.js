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
  const payerPublicKey = response.rawTransaction.accountPubkey;
  const authorized = new Authorized(payerPublicKey, payerPublicKey);
  const lamports =
    Number(response.rawTransaction.amountOfSOL) * LAMPORTS_PER_SOL;
  const createStakeAccountInstruction = StakeProgram.createAccountWithSeed({
    fromPubkey: payerPublicKey,
    stakePubkey: response.rawTransaction.stakePubkey,
    basePubkey: payerPublicKey,
    seed: response.rawTransaction.stakeAccountSeed,
    authorized,
    lockup: new Lockup(0, 0, new PublicKey(0)),
    lamports,
  });
  const votePubkey = new PublicKey(response.rawTransaction.votePubkey);
  const delegateTransactionInstruction = StakeProgram.delegate({
    stakePubkey: response.rawTransaction.stakePubkey,
    authorizedPubkey: payerPublicKey,
    votePubkey,
  });
  const transaction = new Transaction({
    recentBlockhash: response.rawTransaction.recentBlockhash,
    feePayer: payerPublicKey,
    signatures: [],
  }).add(createStakeAccountInstruction);
  transaction.add(delegateTransactionInstruction);
  transaction.instructions[0].keys[2] = {
    pubkey: payerPublicKey,
    isSigner: true,
    isWritable: false,
  };
  return transaction;
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
      accountPubkey: ACCOUNTPUBKEY,
      amountOfSOL: 0.3,
      votePubkey: "3NZ1Wa2spvK6dpbVBhgTh2qfjzNA6wxEAdXMsJJQCDQG",
      connection: CONNECTION,
      stakePubkey: STAKEPUBKEY,
      stakeAccountSeed: STAKEACCOUNTSEED,
      recentBlockhash: RECENTBLOCKHASH.blockhash,
    });
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    const transaction = await createTransaction(response);
    transaction.addSignature(
      response.signatures.publicKey,
      response.signatures.signature
    );
    console.log("verifySignature - ", transaction.verifySignatures());
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
