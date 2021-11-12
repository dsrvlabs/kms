import { BIP32Interface } from "bip32";
import { Account } from "../../types";
export declare class KEYSTORE {
    static getAccount(node: BIP32Interface): Account;
}
