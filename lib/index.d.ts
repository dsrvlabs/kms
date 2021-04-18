/// <reference types="ledgerhq__hw-transport-webusb" />
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { COIN, BIP44 } from "./types";
import { createKeyStore } from "./keyStore";
export { createKeyStore, BIP44, COIN };
interface KeyStore {
    t: number;
    m: number;
    s: string;
    j: string[];
}
interface Ledger {
    keyStore: KeyStore | null;
    transport: TransportWebUSB | null;
}
export declare class KMS {
    private keyStore;
    private transport;
    constructor(ledger: Ledger);
    getAccount(password: string, path: BIP44): Promise<string>;
}
export declare function CreateKMS(keyStoreJson?: KeyStore | null): Promise<KMS>;
