import Transport from "@ledgerhq/hw-transport";
import { Account, BIP44, RawTx, SignedTx } from "../../../types";
export declare class LEDGER {
    static getAccount(path: BIP44, transport: Transport, prefix: string): Promise<Account>;
    static signTx(path: BIP44, transport: Transport, rawTx: RawTx): Promise<SignedTx>;
}
