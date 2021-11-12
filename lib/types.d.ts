export interface BIP44 {
    type: number;
    account: number;
    index: number;
    password?: string;
}
export interface KeyStore {
    t: number;
    m: number;
    s: string;
    j: string[];
}
export interface Account {
    address: string;
    publicKey: string;
}
export interface RawTx {
    [key: string]: any;
}
export interface SignedTx {
    rawTx: RawTx;
    signedTx?: any;
}
export interface SignedMsg {
    msg: string;
    signedMsg?: any;
}
export declare const CHAIN: {
    readonly DSRV: 8080;
    readonly TERRA: 330;
    readonly FLOW: 539;
    readonly SOLANA: 501;
    readonly NEAR: 397;
    readonly KUSAMA: 434;
    readonly POLKADOT: 354;
    readonly COSMOS: 118;
    readonly ETHEREUM: 60;
    readonly CELO: 52752;
    readonly KLAYTN: 8217;
    readonly TEZOS: 1729;
    readonly PERSISTENCE: 750;
    readonly AGORIC: 564;
};
