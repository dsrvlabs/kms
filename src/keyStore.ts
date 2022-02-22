import { mnemonicToSeedSync } from "bip39";
import { fromSeed } from "bip32";
import { CHAIN, Account, BIP44, RawTx, SignedTx, SignedMsg } from "./types";
import { KEYSTORE as cosmos } from "./blockchains/cosmos/keyStore";
import { KEYSTORE as eth } from "./blockchains/ethereum/keyStore";
import { KEYSTORE as solana } from "./blockchains/solana/keyStore";
import { KEYSTORE as polkadot } from "./blockchains/polkadot/keyStore";
import { KEYSTORE as kusama } from "./blockchains/kusama/keyStore";
import { KEYSTORE as near } from "./blockchains/near/keyStore";
import { KEYSTORE as flow } from "./blockchains/flow/keyStore";
import { KEYSTORE as tezos } from "./blockchains/tezos/keyStore";

export async function getAccountFromKeyStore(
  path: BIP44,
  mnemonic: string
): Promise<Account | null> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );
    switch (path.type) {
      case CHAIN.DSRV: {
        const account = await cosmos.getAccount(child, "dsrv");
        return account;
      }
      // blockchains
      case CHAIN.COSMOS: {
        const account = await cosmos.getAccount(child, path.prefix || "cosmos");
        return account;
      }
      case CHAIN.PERSISTENCE: {
        const account = await cosmos.getAccount(child, "persistence");
        return account;
      }
      case CHAIN.AGORIC: {
        const account = await cosmos.getAccount(child, "agoric");
        return account;
      }
      case CHAIN.TERRA: {
        const account = await cosmos.getAccount(child, "terra");
        return account;
      }
      case CHAIN.SOLANA: {
        const account = solana.getAccount(seed, path);
        return account;
      }
      case CHAIN.POLKADOT: {
        const account = polkadot.getAccount(seed, path);
        return account;
      }
      case CHAIN.KUSAMA: {
        const account = kusama.getAccount(child);
        return account;
      }
      case CHAIN.NEAR: {
        const account = near.getAccount(seed, path);
        return account;
      }
      case CHAIN.FLOW: {
        const account = flow.getAccount(child);
        return account;
      }
      case CHAIN.TEZOS: {
        const account = tezos.getAccount(seed, path);
        return account;
      }
      case CHAIN.ETHEREUM:
      case CHAIN.KLAYTN:
      case CHAIN.CELO: {
        const account = eth.getAccount(child);
        return account;
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return null;
  }
}

export async function exportPrivateKey(
  path: BIP44,
  mnemonic: string
): Promise<string> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );
    switch (path.type) {
      case CHAIN.DSRV:
      case CHAIN.COSMOS:
      case CHAIN.PERSISTENCE:
      case CHAIN.AGORIC:
      case CHAIN.TERRA:
      case CHAIN.ETHEREUM:
      case CHAIN.KLAYTN:
      case CHAIN.CELO:
      case CHAIN.FLOW:
      case CHAIN.KUSAMA:
      case CHAIN.POLKADOT: {
        return child.privateKey ? `0x${child.privateKey.toString("hex")}` : "";
      }
      case CHAIN.SOLANA: {
        const privateKey = solana.getPrivateKey(seed, path);
        return privateKey;
      }
      case CHAIN.NEAR: {
        const privateKey = near.getPrivateKey(seed, path);
        return privateKey;
      }
      case CHAIN.TEZOS: {
        const privateKey = tezos.getPrivateKey(seed, path);
        return privateKey;
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }
    return "";
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return "";
  }
}

export async function signTxFromKeyStore(
  path: BIP44,
  mnemonic: string,
  rawTx: RawTx
): Promise<SignedTx> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );

    switch (path.type) {
      /*
      case CHAIN.DSRV: {
        const response = await cosmos.signTx(child, "dsrv", rawTx);
        return { ...response };
      }
      */
      // blockchains
      case CHAIN.NEAR: {
        const response = near.signTx(seed, rawTx, path);
        return { ...response };
      }
      case CHAIN.SOLANA: {
        const response = solana.signTx(seed, rawTx, path);
        return { ...response };
      }
      case CHAIN.COSMOS: {
        const response = await cosmos.signTx(
          child,
          path.prefix || "cosmos",
          rawTx
        );
        return { ...response };
      }
      case CHAIN.PERSISTENCE: {
        const response = await cosmos.signTx(child, "persistence", rawTx);
        return { ...response };
      }
      case CHAIN.TERRA: {
        const response = await cosmos.signTx(child, "terra", rawTx);
        return { ...response };
      }
      case CHAIN.AGORIC: {
        const response = await cosmos.signTx(child, "agoric", rawTx);
        return { ...response };
      }
      case CHAIN.ETHEREUM:
      case CHAIN.KLAYTN:
      case CHAIN.CELO: {
        const response = eth.signTx(child, rawTx);
        return { ...response };
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }

    return { rawTx };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { rawTx };
  }
}

export async function signMsgFromKeyStore(
  path: BIP44,
  mnemonic: string,
  msg: string
): Promise<SignedMsg> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(
      `m/44'/${path.type}'/${path.account}'/0/${path.index}`
    );

    switch (path.type) {
      case CHAIN.DSRV: {
        const response = await cosmos.signMessage(child, "dsrv", msg);
        return { ...response };
      }
      case CHAIN.ETHEREUM:
      case CHAIN.KLAYTN:
      case CHAIN.CELO: {
        const response = await eth.signMessage(child, msg);
        return { ...response };
      }
      // blockchains
      // add blockchains....
      // blockchains
      default:
        break;
    }
    return { msg };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { msg };
  }
}
