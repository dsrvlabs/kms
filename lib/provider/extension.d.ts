/// <reference types="node" />
import { TransportError, StatusCodes, getAltStatusMessage, TransportStatusError } from "@ledgerhq/errors";
import EventEmitter from "events";
export { TransportError, TransportStatusError, StatusCodes, getAltStatusMessage, };
export declare type Subscription = {
    unsubscribe: () => void;
};
export default class Extension {
    private web3;
    private extension;
    constructor(web3: EventEmitter, extension: EventEmitter);
    on(eventName: string, cb: (...args: Array<any>) => any): void;
    off(eventName: string, cb: (...args: Array<any>) => any): void;
    reciver: (cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: Array<number>) => Promise<Buffer>;
    send: (cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: Array<number>) => Promise<Buffer>;
}
export declare function createExtension(web3: EventEmitter, extension: EventEmitter): Extension;
