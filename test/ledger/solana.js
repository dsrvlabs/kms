const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;

const {
  StakeProgram,
  PublicKey,
  Connection,
  Transaction,
  Authorized,
  LAMPORTS_PER_SOL,
  Lockup,
  SystemProgram,
  sendAndConfirmRawTransaction,
} = require("@solana/web3.js");

const { KMS, CHAIN } = require("../../lib");
// const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.SOLANA;
const INDEX = 0;

const TRANSFER = 0;
const CREATESTAKEACCONUT = 1;
const DELEGATE = 2;

async function getAccount(transport, type, index) {
  const kms = new KMS({
    keyStore: null,
    transport,
  });

  const account = await kms.getAccount({
    type,
    account: 0,
    index,
  });
  // eslint-disable-next-line no-console
  console.log("account - ", account);
  return account;
}

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

async function signTx(transport, type, index, account) {
  const kms = new KMS({
    keyStore: null,
    transport,
  });
  try {
    const RPC = "https://api.devnet.solana.com"; // DEV NET
    const CONNECTION = new Connection(RPC, "confirmed");
    const timeStamp = new Date().getTime();
    const STAKEACCOUNTSEED = timeStamp.toString();
    const ACCOUNTPUBKEY = new PublicKey(account);
    const STAKEPUBKEY = await getStakeAccount(STAKEACCOUNTSEED, ACCOUNTPUBKEY);
    const RECENTBLOCKHASH = await CONNECTION.getRecentBlockhash();
    const response = await kms.signTx(
      {
        type,
        account: 0,
        index,
      },
      {
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
      }
    );
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
  const transport = await TransportNodeHid.create(1000);
  const account = await getAccount(transport, TYPE, INDEX);
  await signTx(transport, TYPE, INDEX, account);
  transport.close();
}

run();
