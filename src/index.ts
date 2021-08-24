import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportWebBLE from "@ledgerhq/hw-transport-web-ble";
import Transport from "@ledgerhq/hw-transport";
import { CHAIN, BIP44, RawTx, SignedTx } from "./types";
import { getAccountFromKeyStore, signTxFromKeyStore } from "./keyStore";
import { createKeyStore, getMnemonic, getAlgo2HashKey } from "./argon2";
import { getAccountFromLedger, signTxFromLedger } from "./ledger";

export {
  createKeyStore,
  getAccountFromKeyStore,
  signTxFromKeyStore,
  CHAIN,
  BIP44,
  RawTx,
  SignedTx,
  getAlgo2HashKey,
};

interface KeyStore {
  t: number;
  m: number;
  s: string;
  j: string[];
}

interface Ledger {
  keyStore: KeyStore | null;
  transport: Transport | null;
  onDisconnect?: () => void;
}

export class KMS {
  private keyStore: KeyStore | null;

  private transport: Transport | null;

  constructor(ledger: Ledger) {
    this.keyStore = ledger.keyStore;
    this.transport = ledger.transport;
    this.transport?.on("disconnect", () => {
      if (ledger.onDisconnect) {
        ledger.onDisconnect();
      }
      this.transport?.off("disconnect", () => {});
      this.close();
    });
  }

  isLedger(): boolean {
    return !!this.transport;
  }

  async getAccount(path: BIP44): Promise<string | null> {
    if (this.keyStore) {
      const mnemonic = await getMnemonic(path.password || "", this.keyStore);
      const account = await getAccountFromKeyStore(path, mnemonic);
      return account;
    }
    if (this.transport) {
      const account = await getAccountFromLedger(path, this.transport);
      return account;
    }
    return null;
  }

  async signTx(path: BIP44, rawTx: RawTx): Promise<SignedTx> {
    if (this.keyStore) {
      const mnemonic = await getMnemonic(path.password || "", this.keyStore);
      const signedTx = await signTxFromKeyStore(path, mnemonic, rawTx);
      return signedTx;
    }
    if (this.transport) {
      const response = await signTxFromLedger(path, this.transport, rawTx);
      return response;
    }
    return { rawTx };
  }

  async close(): Promise<void> {
    if (this.transport) {
      const { id } = this.transport as { [key: string]: any };
      if (id) {
        await TransportWebBLE.disconnect(id);
      }
      await this.transport?.close();
      this.transport = null;
    }
  }
}

export async function CreateKMS(keyStoreJson: KeyStore): Promise<KMS> {
  const ledger: Ledger = {
    keyStore: keyStoreJson,
    transport: null,
  };
  return new KMS(ledger);
}

export async function CreateLedger(
  isUsb: boolean,
  onDisconnect: () => void
): Promise<KMS> {
  const ledger: Ledger = {
    keyStore: null,
    transport: isUsb
      ? await TransportWebUSB.create()
      : await TransportWebBLE.create(),
    onDisconnect,
  };
  return new KMS(ledger);
}
