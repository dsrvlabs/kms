import { BIP32Interface } from "bip32";
import { Account, RawTx, SignedTx } from "../../types";
export declare class KEYSTORE {
    static getAccount(node: BIP32Interface): Account;
    private static legacySignTx;
    private static celoSignTx;
    private static klaySignTx;
    static signTx(node: BIP32Interface, rawTx: RawTx): SignedTx;
}
