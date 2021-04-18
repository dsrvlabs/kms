import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { COIN, BIP44 } from "./types";
import { LEDGER as mina } from "./blockchains/mina/ledger";

export async function getAccountFromLedger(
  path: BIP44,
  transport: TransportWebUSB
): Promise<string> {
  try {
    switch (path.type) {
      // blockchains
      case COIN.MINA: {
        const publicKey = await mina.getAccount(path, transport);
        return publicKey;
      }
      // add blockchains....
      // blockchains
      default:
        break;
    }
    return "";
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return "";
  }
}
