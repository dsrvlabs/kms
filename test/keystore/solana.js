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
const CREATESTAKEACCONUT = 1;
const DELEGATE = 2;

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

function createInstruction(ix) {
  if (typeof ix.transactionType !== "number") {
    throw new Error("Instruction has no transaction type");
  }
  switch (ix.transactionType) {
    case 0: {
      // SystemProgram.transfer
      const payerPublicKey = ix.fromPubkey;
      const lamports = Number(ix.amountOfSOL) * LAMPORTS_PER_SOL;
      const toPubkey = new PublicKey(ix.toPubkey);
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: payerPublicKey,
        lamports,
        toPubkey,
      });
      return transferInstruction;
    }
    case 1: {
      // StakeProgram.createAccountWithSeed
      if (typeof ix.amountOfSOL !== "number") {
        throw new Error("Amount is required number");
      }
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
      return createStakeAccountInstruction;
    }
    case 2: {
      // StakeProgram.delegate
      const payerPublicKey = ix.fromPubkey;
      const votePubkey = new PublicKey(ix.votePubkey);
      const delegateTransactionInstruction = StakeProgram.delegate({
        stakePubkey: ix.stakePubkey,
        authorizedPubkey: payerPublicKey,
        votePubkey,
      });
      return delegateTransactionInstruction;
    }
    default:
      break;
  }
  throw new Error("Create instrauction error");
}

async function createTransaction(rawTx) {
  try {
    const transaction = new Transaction({
      recentBlockhash: rawTx.recentBlockhash,
      feePayer: rawTx.feePayer,
    });
    for (let i = 0; i < rawTx.ixs.length; i += 1) {
      transaction.add(createInstruction(rawTx.ixs[i]));
    }
    return transaction;
  } catch (error) {
    throw new Error(error);
  }
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
          stakerAuthorizePubkey: ACCOUNTPUBKEY,
          withdrawerAuthorizePubkey: ACCOUNTPUBKEY,
          stakePubkey: STAKEPUBKEY,
          amountOfSOL: 0.1,
          stakeAccountSeed: STAKEACCOUNTSEED,
          transactionType: CREATESTAKEACCONUT,
        },
        // Delegate
        {
          fromPubkey: ACCOUNTPUBKEY,
          votePubkey: "3NZ1Wa2spvK6dpbVBhgTh2qfjzNA6wxEAdXMsJJQCDQG",
          stakePubkey: STAKEPUBKEY,
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
    // eslint-disable-next-line no-console
    console.log("response - ", response);
    const transaction = await createTransaction(response.rawTransaction);
    transaction.addSignature(
      response.signatures.publicKey,
      response.signatures.signature
    );
    // eslint-disable-next-line no-console
    console.log("verifySignature - ", transaction.verifySignatures());
    // Send Transaction
    // sendTransation(response.rawTransaction.connection, transaction);
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
