import { KeyStore } from './type';
export declare function createKeyStore(mnemonic: string[], password: string, time?: number, mem?: number): Promise<KeyStore>;
