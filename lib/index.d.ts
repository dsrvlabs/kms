import Transport from '@ledgerhq/hw-transport';
import { CHAIN, Account, BIP44, RawTx, SignedTx, SignedMsg } from './types';
import { createKeyStore, getAlgo2HashKey } from './argon2';
import { getAccountFromKeyStore, signTxFromKeyStore } from './keyStore';
import { createWeb3 } from './provider/web3';
import { createExtension } from './provider/extension';
export { createKeyStore, getAccountFromKeyStore, signTxFromKeyStore, CHAIN, Account, BIP44, RawTx, SignedTx, getAlgo2HashKey, createWeb3, createExtension, };
interface KeyStore {
    t: number;
    m: number;
    s: string;
    j: string[];
}
interface Ledger {
    keyStore: KeyStore | null;
    transport: Transport | null;
    onDisconnect?: () => void;
}
export declare class KMS {
    private keyStore;
    private transport;
    constructor(ledger: Ledger);
    isLedger(): boolean;
    getAccount(path: BIP44): Promise<Account | null>;
    signTx(path: BIP44, rawTx: RawTx): Promise<SignedTx>;
    signMsg(path: BIP44, msg: string): Promise<SignedMsg>;
    close(): Promise<void>;
}
export declare function CreateKMS(keyStoreJson: KeyStore): Promise<KMS>;
export declare function CreateLedger(isUsb: boolean, onDisconnect: () => void): Promise<KMS>;
