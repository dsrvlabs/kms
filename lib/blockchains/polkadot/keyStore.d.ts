/// <reference types="node" />
import { Account, BIP44 } from "../../types";
export declare class KEYSTORE {
    static getAccount(seed: Buffer, path: BIP44): Account;
}
