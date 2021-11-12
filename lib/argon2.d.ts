import { JWK } from 'node-jose';
import { KeyStore } from './types';
export declare function getAlgo2HashKey(password: string, keyStore: KeyStore): Promise<JWK.Key | null>;
export declare function getMnemonic(password: string, keyStore: KeyStore): Promise<string>;
export declare function createKeyStore(mnemonic: string[], password: string, time?: number, mem?: number): Promise<KeyStore | null>;
