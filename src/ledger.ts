import Transport from '@ledgerhq/hw-transport';
import { CHAIN, Account, BIP44, RawTx, SignedTx, SignedMsg } from './types';
import { LEDGER as terra } from './blockchains/cosmos/ledger/terra';
import { LEDGER as cosmos } from './blockchains/cosmos/ledger/cosmos';

export async function getAccountFromLedger(
  path: BIP44,
  transport: Transport,
): Promise<Account | null> {
  try {
    switch (path.type) {
      case CHAIN.COSMOS: {
        const account = await cosmos.getAccount(path, transport, 'cosmos');
        return account;
      }
      case CHAIN.PERSISTENCE: {
        const account = await cosmos.getAccount(path, transport, 'persistence');
        return account;
      }
      case CHAIN.AGORIC: {
        const account = await cosmos.getAccount(path, transport, 'agoric');
        return account;
      }
      case CHAIN.TERRA: {
        const account = await terra.getAccount(path, transport);
        return account;
      }
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
  rawTx: RawTx,
): Promise<SignedTx> {
  try {
    switch (path.type) {
      /*
      case CHAIN.DSRV: {
        const response = await cosmos.signTx(path, transport, rawTx);
        return { ...response };
      }
      */
      // blockchains
      case CHAIN.COSMOS: {
        const response = await cosmos.signTx(path, transport, rawTx);
        return { ...response };
      }
      case CHAIN.PERSISTENCE: {
        const response = await cosmos.signTx(path, transport, rawTx);
        return { ...response };
      }
      case CHAIN.TERRA: {
        const response = await terra.signTx(path, transport, rawTx);
        return { ...response };
      }
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

export async function signMsgFromLedger(
  path: BIP44,
  _transport: Transport,
  msg: string,
): Promise<SignedMsg> {
  try {
    switch (path.type) {
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
