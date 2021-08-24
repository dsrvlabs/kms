import {
  TransportError,
  StatusCodes,
  getAltStatusMessage,
  TransportStatusError,
} from "@ledgerhq/errors";

import EventEmitter from "events";

export {
  TransportError,
  TransportStatusError,
  StatusCodes,
  getAltStatusMessage,
};

export type Subscription = {
  unsubscribe: () => void;
};

export default class Extension {
  private web3: EventEmitter;

  private extension: EventEmitter;

  constructor(web3: EventEmitter, extension: EventEmitter) {
    this.web3 = web3;
    this.extension = extension;
  }

  // eslint-disable-next-line no-unused-vars
  on(eventName: string, cb: (...args: Array<any>) => any): void {
    this.web3.emit("on", eventName);
    this.extension.on(eventName, cb);
  }

  // eslint-disable-next-line no-unused-vars
  off(eventName: string, cb: (...args: Array<any>) => any): void {
    this.web3.emit("off", eventName);
    this.extension.off(eventName, cb);
  }

  reciver = async (
    cla: number,
    ins: number,
    p1: number,
    p2: number,
    data: Buffer = Buffer.alloc(0),
    statusList: Array<number> = [StatusCodes.OK]
  ): Promise<Buffer> => {
    return new Promise((resoleve) => {
      this.extension.once("receive", resoleve);
      this.web3.emit("send", cla, ins, p1, p2, data, statusList);
    });
  };

  send = async (
    cla: number,
    ins: number,
    p1: number,
    p2: number,
    data: Buffer = Buffer.alloc(0),
    statusList: Array<number> = [StatusCodes.OK]
  ): Promise<Buffer> => {
    const buffer = await this.reciver(cla, ins, p1, p2, data, statusList);
    return buffer;
  };
}

export function createExtension(
  web3: EventEmitter,
  extension: EventEmitter
): Extension {
  return new Extension(web3, extension);
}
