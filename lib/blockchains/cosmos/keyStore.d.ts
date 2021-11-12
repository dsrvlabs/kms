import { BIP32Interface } from "bip32";
import { Account, RawTx, SignedTx } from "../../types";
export declare class KEYSTORE {
    static getAccount(node: BIP32Interface, prefix: string): Account;
    static signTx(node: BIP32Interface, prefix: string, rawTx: RawTx): Promise<SignedTx>;
    static signMessage(node: BIP32Interface, _prefix: string, msg: string): Promise<{
        msg: string;
        signedMsg: {
            signature: Uint8Array;
            recid: number;
        };
    } | {
        msg: string;
        signedMsg?: undefined;
    }>;
}
