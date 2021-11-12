import { Account, BIP44, RawTx, SignedTx, SignedMsg } from './types';
export declare function getAccountFromKeyStore(path: BIP44, mnemonic: string): Promise<Account | null>;
export declare function signTxFromKeyStore(path: BIP44, mnemonic: string, rawTx: RawTx): Promise<SignedTx>;
export declare function signMsgFromKeyStore(path: BIP44, mnemonic: string, msg: string): Promise<SignedMsg>;
