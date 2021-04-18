export interface BIP44 {
  type: number;
  account: number;
  index: number;
}

export const COIN = {
  MINA: 12586,
} as const;
