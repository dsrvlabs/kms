import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportWebBLE from "@ledgerhq/hw-transport-web-ble";
import Transport from "@ledgerhq/hw-transport";
import { JWTVerified } from "did-jwt";
import { CHAIN, Account, BIP44, RawTx, SignedTx, SignedMsg } from "./types";
import { createKeyStore, getMnemonic, getAlgo2HashKey } from "./argon2";
import {
  getAccountFromKeyStore,
  exportPrivateKey,
  signTxFromKeyStore,
  signMsgFromKeyStore,
} from "./keyStore";
import {
  getAccountFromLedger,
  signTxFromLedger,
  signMsgFromLedger,
} from "./ledger";
import { createDid, verifyDid } from "./did";
import { KEYSTORE as cosmos } from "./blockchains/cosmos/keyStore";
import { KEYSTORE as ethereum } from "./blockchains/ethereum/keyStore";
import { KEYSTORE as solana } from "./blockchains/solana/keyStore";
import { KEYSTORE as near } from "./blockchains/near/keyStore";

const blockchains = {
  cosmos,
  ethereum,
  solana,
  near,
};

export {
  createKeyStore,
  getAccountFromKeyStore,
  exportPrivateKey,
  signTxFromKeyStore,
  signMsgFromKeyStore,
  CHAIN,
  Account,
  BIP44,
  RawTx,
  SignedTx,
  getAlgo2HashKey,
  blockchains,
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

  async getAccount(path: BIP44): Promise<Account | null> {
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

  async exportPrivateKey(path: BIP44): Promise<string> {
    if (this.keyStore) {
      const mnemonic = await getMnemonic(path.password || "", this.keyStore);
      const privatekey = await exportPrivateKey(path, mnemonic);
      return privatekey;
    }
    return "";
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

  async signMsg(path: BIP44, msg: string): Promise<SignedMsg> {
    if (this.keyStore) {
      const mnemonic = await getMnemonic(path.password || "", this.keyStore);
      const response = await signMsgFromKeyStore(path, mnemonic, msg);
      return response;
    }
    if (this.transport) {
      const response = await signMsgFromLedger(path, this.transport, msg);
      return response;
    }
    return { msg };
  }

  async DidDocCreate(path: BIP44, name: string): Promise<string> {
    if (this.keyStore) {
      const mnemonic = await getMnemonic(path.password || "", this.keyStore);
      const doc = await createDid(path, mnemonic, name);
      return doc;
    }
    return "";
  }

  static async DidDocVerify(
    jwt: string,
    audience: string
  ): Promise<JWTVerified | null> {
    const result = verifyDid(jwt, audience);
    return result;
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
