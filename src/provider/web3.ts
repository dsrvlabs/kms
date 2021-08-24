import {
  TransportError,
  StatusCodes,
  getAltStatusMessage,
  TransportStatusError,
} from "@ledgerhq/errors";
import Ledger from "@ledgerhq/hw-transport";

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

export default class Web3 {
  private ledger: Ledger;

  private web3: EventEmitter;

  private extension: EventEmitter;

  constructor(transport: Ledger, web3: EventEmitter, extension: EventEmitter) {
    this.ledger = transport;
    this.web3 = web3;
    this.extension = extension;
    this.web3.on("on", (eventName: string) =>
      this.ledger.on(eventName, (...args: Array<any>) =>
        this.extension.emit(eventName, ...args)
      )
    );
    this.web3.on("off", (eventName: string) =>
      this.ledger.off(eventName, (...args: Array<any>) =>
        this.extension.emit(eventName, ...args)
      )
    );
    this.web3.on(
      "send",
      async (
        cla: number,
        ins: number,
        p1: number,
        p2: number,
        data: Buffer = Buffer.alloc(0),
        statusList: Array<number> = [StatusCodes.OK]
      ): Promise<void> => {
        try {
          const buffer: Buffer = await this.ledger.send(
            cla,
            ins,
            p1,
            p2,
            data,
            statusList
          );
          this.extension.emit("receive", {
            isSuccess: true,
            buffer,
            error: "",
          });
        } catch (error) {
          this.extension.emit("receive", {
            isSuccess: false,
            buffer: [],
            error,
          });
        }
      }
    );
  }

  send = async (
    cla: number,
    ins: number,
    p1: number,
    p2: number,
    data: Buffer = Buffer.alloc(0),
    statusList: Array<number> = [StatusCodes.OK]
  ): Promise<Buffer> => {
    const buffer: Buffer = await this.ledger.send(
      cla,
      ins,
      p1,
      p2,
      data,
      statusList
    );
    return buffer;
  };
}

export function createWeb3(
  transport: Ledger,
  web3: EventEmitter,
  extension: EventEmitter
): Web3 {
  return new Web3(transport, web3, extension);
}
