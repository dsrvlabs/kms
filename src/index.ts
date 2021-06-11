import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { COIN, BIP44, RawTx } from "./types";
import { createKeyStore, getAccountFromKeyStore } from "./keyStore";
import { getAccountFromLedger, signTxFromLedger } from "./ledger";

export { createKeyStore, COIN, BIP44, RawTx };

interface KeyStore {
  t: number;
  m: number;
  s: string;
  j: string[];
}

interface Ledger {
  keyStore: KeyStore | null;
  transport: TransportWebUSB | TransportNodeHid | null;
}

export class KMS {
  private keyStore: KeyStore | null;

  private transport: TransportWebUSB | TransportNodeHid | null;

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
      return {};
    }
    if (this.transport) {
      const response = await signTxFromLedger(path, this.transport, rawTx);
      return response;
    }
    return {};
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
    ledger.transport = await TransportWebUSB.create();
  }
  return new KMS(ledger);
}
