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
  FLOW: 539,
  SOLANA: 501,
  NEAR: 397,
  KUSAMA: 434,
  POLKADOT: 354,
  COSMOS: 118,
  CELO: 52752,
  TEZOS: 1729,
} as const;
