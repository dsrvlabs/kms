import { generateMnemonic } from 'bip39';

export function CreateMnemonic(): string {
  return generateMnemonic(256);
}
