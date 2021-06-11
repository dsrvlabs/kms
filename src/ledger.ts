import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { COIN, BIP44, RawTx } from "./types";
import { LEDGER as mina } from "./blockchains/mina/ledger";
import { LEDGER as terra } from "./blockchains/terra/ledger";
import { LEDGER as flow } from "./blockchains/flow/ledger";
import { LEDGER as solana } from "./blockchains/solana/ledger";
import { LEDGER as near } from "./blockchains/near/ledger";
import { LEDGER as kusama } from "./blockchains/kusama/ledger";
import { LEDGER as polkadot } from "./blockchains/polkadot/ledger";
import { LEDGER as cosmos } from "./blockchains/cosmos/ledger";
import { LEDGER as celo } from "./blockchains/celo/ledger";

export async function getAccountFromLedger(
  path: BIP44,
  transport: TransportWebUSB | TransportNodeHid
): Promise<string> {
  try {
    switch (path.type) {
      // blockchains
      case COIN.MINA: {
        const publicKey = await mina.getAccount(path, transport);
        return publicKey;
      }
      case COIN.TERRA: {
        const publicKey = await terra.getAccount(path, transport);
        return publicKey;
      }
      case COIN.FLOW: {
        const publicKey = await flow.getAccount(path, transport);
        return publicKey;
      }
      case COIN.SOLANA: {
        const publicKey = await solana.getAccount(path, transport);
        return publicKey;
      }
      case COIN.NEAR: {
        const publicKey = await near.getAccount(path, transport);
        return publicKey;
      }
      case COIN.KUSAMA: {
        const publicKey = await kusama.getAccount(path, transport);
        return publicKey;
      }
      case COIN.POLKADOT: {
        const publicKey = await polkadot.getAccount(path, transport);
        return publicKey;
      }
      case COIN.COSMOS: {
        const publicKey = await cosmos.getAccount(path, transport);
        return publicKey;
      }
      case COIN.CELO: {
        const publicKey = await celo.getAccount(path, transport);
        return publicKey;
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

export async function signTxFromLedger(
  path: BIP44,
  transport: TransportWebUSB | TransportNodeHid,
  rawTx: RawTx
): Promise<{ [key: string]: any }> {
  try {
    switch (path.type) {
      // blockchains
      case COIN.MINA: {
        const response = await mina.signTx(path, transport, rawTx);
        return { ...response };
      }
      case COIN.TERRA: {
        const response = await terra.signTx(path, transport, rawTx);
        return { ...response };
      }
      case COIN.COSMOS: {
        const response = await cosmos.signTx(path, transport, rawTx);
        return { ...response };
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }
    return {};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return {};
  }
}
