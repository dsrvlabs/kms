import { mnemonicToSeedSync } from 'bip39';
import { fromSeed } from 'bip32';
import { CHAIN, Account, BIP44, RawTx, SignedTx, SignedMsg } from './types';
import { KEYSTORE as eth } from './blockchains/ethereum/keyStore';

export async function getAccountFromKeyStore(
  path: BIP44,
  mnemonic: string,
): Promise<Account | null> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(`m/44'/${path.type}'/${path.account}'/0/${path.index}`);
    switch (path.type) {
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

export async function signTxFromKeyStore(
  path: BIP44,
  mnemonic: string,
  rawTx: RawTx,
): Promise<SignedTx> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    const child = node.derivePath(`m/44'/${path.type}'/${path.account}'/0/${path.index}`);

    switch (path.type) {
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
  msg: string,
): Promise<SignedMsg> {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const node = fromSeed(seed);
    node.derivePath(`m/44'/${path.type}'/${path.account}'/0/${path.index}`);

    return { msg };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { msg };
  }
}
