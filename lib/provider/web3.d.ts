/// <reference types="node" />
import { TransportError, StatusCodes, getAltStatusMessage, TransportStatusError } from "@ledgerhq/errors";
import Ledger from "@ledgerhq/hw-transport";
import EventEmitter from "events";
export { TransportError, TransportStatusError, StatusCodes, getAltStatusMessage, };
export declare type Subscription = {
    unsubscribe: () => void;
};
export default class Web3 {
    private ledger;
    private web3;
    private extension;
    constructor(transport: Ledger, web3: EventEmitter, extension: EventEmitter);
    send: (cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: Array<number>) => Promise<Buffer>;
}
export declare function createWeb3(transport: Ledger, web3: EventEmitter, extension: EventEmitter): Web3;
