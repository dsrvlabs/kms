import Transport from '@ledgerhq/hw-transport';
import { Account, BIP44, RawTx, SignedTx, SignedMsg } from './types';
export declare function getAccountFromLedger(path: BIP44, transport: Transport): Promise<Account | null>;
export declare function signTxFromLedger(path: BIP44, transport: Transport, rawTx: RawTx): Promise<SignedTx>;
export declare function signMsgFromLedger(path: BIP44, _transport: Transport, msg: string): Promise<SignedMsg>;
