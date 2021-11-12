import { JWTVerified } from "did-jwt";
import { BIP44 } from "../types";
export declare function verifyDid(jwt: string, audience: string): Promise<JWTVerified | null>;
export declare function createDid(path: BIP44, mnemonic: string): Promise<string>;
