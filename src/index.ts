import { generateMnemonic } from 'bip39';
import { createKeyStore } from './argon2';

export function createMnemonic(): string {
  return generateMnemonic(256);
}

export { createKeyStore };
