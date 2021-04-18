import { BIP44 } from "./types";
export interface KeyStore {
    t: number;
    m: number;
    s: string;
    j: string[];
}
export declare function createKeyStore(mnemonic: string[], password: string): Promise<KeyStore>;
export declare function getAccountFromKeyStore(path: BIP44, keyStore: KeyStore, password: string): Promise<string>;
