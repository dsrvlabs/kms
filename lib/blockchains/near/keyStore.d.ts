/// <reference types="node" />
import { Account, BIP44, RawTx, SignedTx } from "../../types";
export declare class KEYSTORE {
    private static getPrivateKey;
    private static getKeyPair;
    static getAccount(seed: Buffer, path: BIP44): Account;
    static signTx(seed: Buffer, path: BIP44, rawTx: RawTx): SignedTx;
}
