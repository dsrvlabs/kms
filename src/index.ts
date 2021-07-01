import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Transport from "@ledgerhq/hw-transport";
import { CHAIN, BIP44, RawTx } from "./types";
import {
  createKeyStore,
  getAccountFromKeyStore,
  signTxFromKeyStore,
} from "./keyStore";
import { getAccountFromLedger, signTxFromLedger } from "./ledger";

export { createKeyStore, CHAIN, BIP44, RawTx };

interface KeyStore {
  t: number;
  m: number;
  s: string;
  j: string[];
}

interface Ledger {
  keyStore: KeyStore | null;
  transport: Transport | null;
}

export class KMS {
  private keyStore: KeyStore | null;

  private transport: Transport | null;

  constructor(ledger: Ledger) {
    this.keyStore = ledger.keyStore;
    this.transport = ledger.transport;
  }

  async getAccount(path: BIP44): Promise<string> {
    if (this.keyStore) {
      const account = await getAccountFromKeyStore(
        path,
        this.keyStore,
        path.password || ""
      );
      return account;
    }
    if (this.transport) {
      const account = await getAccountFromLedger(path, this.transport);
      return account;
    }
    return "";
  }

  async signTx(path: BIP44, rawTx: RawTx): Promise<{ [key: string]: any }> {
    if (this.keyStore) {
      const signedTx = await signTxFromKeyStore(
        path,
        this.keyStore,
        path.password || "",
        rawTx
      );
      return signedTx;
    }
    if (this.transport) {
      const response = await signTxFromLedger(path, this.transport, rawTx);
      return response;
    }
    return {};
  }

  close(): void {
    this.transport?.close();
    this.transport = null;
  }
}

export async function CreateKMS(
  keyStoreJson: KeyStore | null = null
): Promise<KMS> {
  const ledger: Ledger = {
    keyStore: null,
    transport: null,
  };
  if (keyStoreJson) {
    ledger.keyStore = keyStoreJson;
  } else {
    ledger.transport = await TransportWebUSB.create(1000);
  }
  return new KMS(ledger);
}
