import Transport from "@ledgerhq/hw-transport";
import { CHAIN, BIP44, RawTx } from "./types";
import { LEDGER as mina } from "./blockchains/mina/ledger";
import { LEDGER as terra } from "./blockchains/terra/ledger";
import { LEDGER as flow } from "./blockchains/flow/ledger";
import { LEDGER as solana } from "./blockchains/solana/ledger";
import { LEDGER as near } from "./blockchains/near/ledger";
import { LEDGER as kusama } from "./blockchains/kusama/ledger";
import { LEDGER as polkadot } from "./blockchains/polkadot/ledger";
import { LEDGER as cosmos } from "./blockchains/cosmos/ledger";
import { LEDGER as celo } from "./blockchains/celo/ledger";
import { LEDGER as tezos } from "./blockchains/tezos/ledger";

export async function getAccountFromLedger(
  path: BIP44,
  transport: Transport
): Promise<string | null> {
  try {
    switch (path.type) {
      // blockchains
      case CHAIN.MINA: {
        const publicKey = await mina.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.TERRA: {
        const publicKey = await terra.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.FLOW: {
        const publicKey = await flow.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.SOLANA: {
        const publicKey = await solana.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.NEAR: {
        const publicKey = await near.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.KUSAMA: {
        const publicKey = await kusama.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.POLKADOT: {
        const publicKey = await polkadot.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.COSMOS: {
        const publicKey = await cosmos.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.CELO: {
        const publicKey = await celo.getAccount(path, transport);
        return publicKey;
      }
      case CHAIN.TEZOS: {
        const publicKey = await tezos.getAccount(path, transport);
        return publicKey;
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

export async function signTxFromLedger(
  path: BIP44,
  transport: Transport,
  rawTx: RawTx
): Promise<{ [key: string]: any } | null> {
  try {
    switch (path.type) {
      // blockchains
      case CHAIN.MINA: {
        const response = await mina.signTx(path, transport, rawTx);
        return { ...response };
      }
      case CHAIN.TERRA: {
        const response = await terra.signTx(path, transport, rawTx);
        return { ...response };
      }
      case CHAIN.COSMOS: {
        const response = await cosmos.signTx(path, transport, rawTx);
        return { ...response };
      }
      case CHAIN.NEAR: {
        const response = await near.signTx(path, transport, rawTx);
        return { ...response };
      }
      case CHAIN.SOLANA: {
        const response = await solana.signTx(path, transport, rawTx);
        return { ...response };
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
