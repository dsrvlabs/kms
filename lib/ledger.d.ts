/// <reference types="ledgerhq__hw-transport-webusb" />
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { BIP44 } from "./types";
export declare function getAccountFromLedger(path: BIP44, transport: TransportWebUSB): Promise<string>;
