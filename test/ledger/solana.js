const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const {
  StakeProgram,
  PublicKey,
  Connection,
  Transaction,
  Authorized,
  LAMPORTS_PER_SOL,
  Lockup,
} = require("@solana/web3.js");
const { KMS, CHAIN } = require("../../lib");
// const { getAccount } = require("./_getAccount");

const TYPE = CHAIN.SOLANA;
const INDEX = 0;

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
  return stakePubkey;
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
  return transaction;
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
    console.log("stakePubkey - ", STAKEPUBKEY.toString());
    const RECENTBLOCKHASH = await CONNECTION.getRecentBlockhash();
    const response = await kms.signTx(
      {
        type,
        account: 0,
        index,
      },
      {
        accountPubkey: ACCOUNTPUBKEY,
        amountOfSOL: 0.3,
        votePubkey: "3NZ1Wa2spvK6dpbVBhgTh2qfjzNA6wxEAdXMsJJQCDQG",
        connection: CONNECTION,
        stakePubkey: STAKEPUBKEY,
        stakeAccountSeed: STAKEACCOUNTSEED,
        recentBlockhash: RECENTBLOCKHASH.blockhash,
      }
    );
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
  const transport = await TransportNodeHid.create(1000);
  const account = await getAccount(transport, TYPE, INDEX); // const account = await getAccount(transport, TYPE, INDEX);
  await signTx(transport, TYPE, INDEX, account);
  transport.close();
}

run();
