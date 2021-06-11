export interface BIP44 {
  type: number;
  account: number;
  index: number;
  password?: string;
}

export interface RawTx {
  [key: string]: any;
}

export const COIN = {
  MINA: 12586,
  TERRA: 330,
  FLOW: 769,
  SOLANA: 2017,
  NEAR: 397,
  KUSAMA: 434,
  POLKADOT: 354,
  COSMOS: 118,
  CELO: 52752,
} as const;
