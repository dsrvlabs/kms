import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { COIN, BIP44 } from "./types";
import { createKeyStore, getAccountFromKeyStore } from "./keyStore";
import { getAccountFromLedger } from "./ledger";

export { createKeyStore, BIP44, COIN };

interface KeyStore {
  t: number;
  m: number;
  s: string;
  j: string[];
}

interface Ledger {
  keyStore: KeyStore | null;
  transport: TransportWebUSB | null;
}

export class KMS {
  private keyStore: KeyStore | null;

  private transport: TransportWebUSB | null;

  constructor(ledger: Ledger) {
    this.keyStore = ledger.keyStore;
    this.transport = ledger.transport;
  }

  async getAccount(password: string, path: BIP44): Promise<string> {
    if (this.keyStore) {
      const account = await getAccountFromKeyStore(
        path,
        this.keyStore,
        password
      );
      return account;
    }
    if (this.transport) {
      const account = await getAccountFromLedger(path, this.transport);
      return account;
    }
    return "";
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
