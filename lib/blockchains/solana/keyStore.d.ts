/// <reference types="node" />
import { Keypair } from "@solana/web3.js";
import { Account, BIP44, RawTx, SignedTx } from "../../types";
export declare class KEYSTORE {
    static getKeypair(seed: Buffer, path: BIP44): Keypair;
    static getAccount(seed: Buffer, path: BIP44): Account;
    static getPrivateKey(seed: Buffer, path: BIP44): string;
    static signTx(seed: Buffer, path: BIP44, rawTx: RawTx): SignedTx;
}
