const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;

const {
  StakeProgram,
  PublicKey,
  Connection,
  sendAndConfirmRawTransaction,
} = require("@solana/web3.js");

const { KMS, CHAIN } = require("../../lib");
// const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.SOLANA;
const INDEX = 0;

const TRANSFER = 0;
const CREATESTAKEACCONUT = 1;
const DELEGATE = 2;
const UNDELEGATE = 3;

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
            stakePubkey: "5vGVDMjFfcPs5F7km5BhM6c9E6H9kFR2z5VzsgRrsvpS",
            transactionType: UNDELEGATE,
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
  const transport = await TransportNodeHid.create(1000);
  const account = await getAccount(transport, TYPE, INDEX);
  await signTx(transport, TYPE, INDEX, account);
  transport.close();
}

run();
