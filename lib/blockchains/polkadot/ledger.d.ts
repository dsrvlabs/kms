import Transport from "@ledgerhq/hw-transport";
import { Account, BIP44 } from "../../types";
export declare class LEDGER {
    static getAccount(path: BIP44, transport: Transport): Promise<Account>;
}
